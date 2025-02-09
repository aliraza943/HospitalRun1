import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useLocation } from "react-router-dom";
import { useState, useMemo,useEffect } from "react";

const localizer = momentLocalizer(moment);

const ViewStaffComp = () => {
  const location = useLocation();
  const staff = location.state?.staff;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    clientName: "",
    serviceType: "",
    charges: "",
    start: null,
    end: null,
  });
  useEffect(() => {
    fetchAppointments();
  }, [staff]);


  const fetchAppointments = async () => {
    if (!staff) return;
    try {
      const response = await fetch(`http://localhost:8080/api/staff/appointments/${staff._id}`);
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleSlotSelect = (slotInfo) => {
    const { start, end } = slotInfo;
    if (!staff) return;

    // Convert selected slot times to UTC moments
    const selectedStartUTC = moment(start).utc();
    const selectedEndUTC = moment(end).utc();

    // Check if the selected slot is within working hours
    const dayOfWeek = selectedStartUTC.format("dddd");
    const workingSlots = staff.workingHours[dayOfWeek];
    if (!workingSlots || workingSlots.length === 0) {
      alert("No working hours for this day.");
      return;
    }

    let isWithinWorkingHours = false;
    workingSlots.forEach((slot) => {
      const [startStr, endStr] = slot.split(" - ");
      const slotStart = moment(selectedStartUTC.format("YYYY-MM-DD") + " " + startStr, "YYYY-MM-DD h:mm A").utc();
      const slotEnd = moment(selectedStartUTC.format("YYYY-MM-DD") + " " + endStr, "YYYY-MM-DD h:mm A").utc();

      if (
        selectedStartUTC.isBetween(slotStart, slotEnd, null, "[)") &&
        selectedEndUTC.isBetween(slotStart, slotEnd, null, "(]")
      ) {
        isWithinWorkingHours = true;
      }
    });

    if (!isWithinWorkingHours) {
      alert("Selected slot is outside working hours.");
      return;
    }

    // Check for overlapping appointments
    const isSlotOccupied = appointments.some((appointment) => {
      const appointmentStartUTC = moment.utc(appointment.start);
      const appointmentEndUTC = moment.utc(appointment.end);

      return (
        selectedStartUTC.isBefore(appointmentEndUTC) &&
        selectedEndUTC.isAfter(appointmentStartUTC)
      );
    });

    if (isSlotOccupied) {
      alert("This time slot is already occupied. Please select a different time.");
      return;
    }
 

    setNewEvent({ ...newEvent, start, end });
    setShowModal(true);
  };

  const handleSubmitEvent = async () => {
    if (!newEvent.title || !newEvent.clientName || !newEvent.serviceType || !newEvent.charges) {
      alert("Please fill all fields.");
      return;
    }

    // Convert new event times to UTC moments
    const formattedStartUTC = moment(newEvent.start).utc();
    const formattedEndUTC = moment(newEvent.end).utc();

    // Check for overlapping appointments
    const isSlotOccupied = appointments.some((appointment) => {
      const appointmentStartUTC = moment.utc(appointment.start);
      const appointmentEndUTC = moment.utc(appointment.end);

      return (
        formattedStartUTC.isBefore(appointmentEndUTC) &&
        formattedEndUTC.isAfter(appointmentStartUTC)
      );
    });

    if (isSlotOccupied) {
      alert("This time slot is already occupied. Please select a different time.");
      return;
    }

    const appointmentData = {
      staffId: staff._id,
      title: newEvent.title,
      clientName: newEvent.clientName,
      serviceType: newEvent.serviceType,
      charges: newEvent.charges,
      start: formattedStartUTC.toDate(), // Convert back to Date for server
      end: formattedEndUTC.toDate(),
    };

    try {
      const response = await fetch("http://localhost:8080/api/staff/appointments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        fetchAppointments();
        setNewEvent({
          title: "",
          clientName: "",
          serviceType: "",
          charges: "",
          start: null,
          end: null,
        });
         // Refresh appointments from server
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error adding appointment:", error);
    }
  };
  


  
  const dayNameToIndex = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  // Determine which days have workingHours set to null.
  const nonWorkingDays = Object.entries(staff?.workingHours || {})
    .filter(([_, hours]) => hours === null)
    .map(([day]) => dayNameToIndex[day] + 1);

  // Hide a day entirely if there are no working hours.
  const customDayPropGetter = (date) => {
    const dayOfWeek = moment(date).format("dddd");
    if (!staff?.workingHours[dayOfWeek]) {
      return { style: { display: "none" } };
    }
    return {};
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  // -----------------------------
  // 1. Compute the overall working range
  // -----------------------------
  //
  // We loop through all days (that are not null) and for each time slot
  // parse the start and end times (using a dummy date "2000-01-01") so that
  // we can compare them. The earliest start time and the latest end time are
  // then used as the boundaries for the day.
  //
  // Note: If a staff member has no working hours (or staff is not loaded),
  // default values will be provided.
  const workingRange = useMemo(() => {
    // Use a dummy date to compare times.
    let minTime = moment("2000-01-01 23:59", "YYYY-MM-DD HH:mm");
    let maxTime = moment("2000-01-01 00:00", "YYYY-MM-DD HH:mm");

    Object.entries(staff?.workingHours || {}).forEach(([day, slots]) => {
      if (slots && Array.isArray(slots)) {
        slots.forEach((slot) => {
          const [startStr, endStr] = slot.split(" - ");
          const startMoment = moment("2000-01-01 " + startStr, "YYYY-MM-DD h:mm A");
          const endMoment = moment("2000-01-01 " + endStr, "YYYY-MM-DD h:mm A");
          if (startMoment.isBefore(minTime)) {
            minTime = startMoment;
          }
          if (endMoment.isAfter(maxTime)) {
            maxTime = endMoment;
          }
        });
      }
    });
    return { min: minTime.toDate(), max: maxTime.toDate() };
  }, [staff]);


  const handleEventSelect =  (event) => {
    if (event.title === "Non Working Hours") return;
    setSelectedEvent(event);
    console.log("THIS EVENMT",event)
    
    setShowEventDetailsModal(true);// Prevent deletion of non-working hours
  
    
  };
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
  
    try {
      const response = await fetch("http://localhost:8080/api/staff/appointments/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId: staff._id,
          start: selectedEvent.start,
          end: selectedEvent.end,
        }),
      });
  
      if (response.ok) {
        setAppointments(appointments.filter((appt) => appt._id !== selectedEvent._id));
        setShowEventDetailsModal(false);
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };
  
  

  // -----------------------------
  // 2. Generate non‐working events using the computed boundaries
  // -----------------------------
  //
  // For each day with defined working slots, we’ll:
  // - Set the day’s start and end boundaries by applying the hours/minutes of
  //   workingRange.min/max to the specific day.
  // - Parse each working slot and create “Non Working Hours” events for:
  //   - The gap before the first slot
  //   - Gaps between slots
  //   - The gap after the last slot
  const generateNonWorkingEventsForDay = (day, workingSlots, dayMin, dayMax) => {
    // Set the boundaries for the specific day using the computed workingRange.
    const dayStart = moment(day).set({
      hour: moment(dayMin).hour(),
      minute: moment(dayMin).minute(),
      second: 0,
      millisecond: 0,
    });
    const dayEnd = moment(day).set({
      hour: moment(dayMax).hour(),
      minute: moment(dayMax).minute(),
      second: 0,
      millisecond: 0,
    });

    // Parse each working slot into moment objects.
    const intervals = workingSlots.map((slot) => {
      const [startStr, endStr] = slot.split(" - ");
      const startTime = moment(day.format("YYYY-MM-DD") + " " + startStr, "YYYY-MM-DD h:mm A");
      const endTime = moment(day.format("YYYY-MM-DD") + " " + endStr, "YYYY-MM-DD h:mm A");
      return { start: startTime, end: endTime };
    });

    // Sort by start time.
    intervals.sort((a, b) => a.start - b.start);

    const nonWorkingEvents = [];
    // If there’s a gap before the first working slot.
    if (intervals.length > 0 && dayStart.isBefore(intervals[0].start)) {
      nonWorkingEvents.push({
        title: "Non Working Hours",
        start: dayStart.toDate(),
        end: intervals[0].start.toDate(),
      });
    }
    // Gaps between working slots.
    for (let i = 0; i < intervals.length - 1; i++) {
      if (intervals[i].end.isBefore(intervals[i + 1].start)) {
        nonWorkingEvents.push({
          title: "Non Working Hours",
          start: intervals[i].end.toDate(),
          end: intervals[i + 1].start.toDate(),
        });
      }
    }
    // If there’s a gap after the last working slot.
    if (intervals.length > 0 && intervals[intervals.length - 1].end.isBefore(dayEnd)) {
      nonWorkingEvents.push({
        title: "Non Working Hours",
        start: intervals[intervals.length - 1].end.toDate(),
        end: dayEnd.toDate(),
      });
    }
    return nonWorkingEvents;
  };

  const generateNonWorkingEvents = () => {
    if (!staff) return [];
    let events = [];
    // Get the start of the current week (Sunday by default).
    const startOfWeek = moment(currentDate).startOf("week");
    // Loop through the 7 days.
    for (let i = 0; i < 7; i++) {
      const day = moment(startOfWeek).add(i, "days");
      const dayName = day.format("dddd");
      const workingSlots = staff?.workingHours[dayName];
      if (workingSlots && Array.isArray(workingSlots) && workingSlots.length > 0) {
        const dayEvents = generateNonWorkingEventsForDay(day, workingSlots, workingRange.min, workingRange.max);
        events = events.concat(dayEvents);
      }
    }
    return events;
  };

  // Memoize the non-working events so that they update when either staff or the current date changes.
  const nonWorkingEvents = useMemo(() => (staff ? generateNonWorkingEvents() : []), [staff, currentDate, workingRange]);
  const events = useMemo(() => {
    if (!staff) return [];
  
    // Format appointments correctly
    const formattedAppointments = appointments.map((appointment) => ({
      ...appointment, // Spread all appointment properties
      title: appointment.title || "Booked Appointment",
      start: moment(appointment.start).toDate(),
      end: moment(appointment.end).toDate(),
      clientName: appointment.clientName,
      serviceType: appointment.serviceType,
      serviceCharges: appointment.serviceCharges // Note: matching the name used in modal
    }));
  
    // Combine appointments with non-working hours
    return [...formattedAppointments, ...nonWorkingEvents];
  }, [staff, appointments, nonWorkingEvents]);
  

  // Format the working range for display.
  const workingRangeDisplay = `${moment(workingRange.min).format("h:mm A")} - ${moment(workingRange.max).format("h:mm A")}`;
  const eventStyleGetter = (event) => {
    if (event.title === "Non Working Hours") {
      return {
        className: 'non-working-hours',
        style: {
          backgroundColor: '#808080 !important',
          color: '#fff',
          borderRadius: '0px',
          border: 'none',
          opacity: 1,
          pointerEvents: 'none',
          cursor: 'default'
        }
      };
    }
    return {
      className: 'working-appointment',
      style: {
        backgroundColor: '#3174ad !important',
        color: 'white',
        borderRadius: '5px',
        border: 'none'
      }
    };
  };
  const customStyles = `
  .rbc-event.non-working-hours {
    background-color: #808080 !important;
  }
  .rbc-event.non-working-hours:hover {
    background-color: #808080 !important;
  }
  .rbc-event.working-appointment {
    background-color: #3174ad !important;
  }
  .rbc-event.working-appointment:hover {
    background-color: #3174ad !important;
  }
  .rbc-event.rbc-selected {
    background-color: inherit !important;
  }
  .rbc-event {
    background-color: #3174ad !important;
  }
`;




  

  return (
    <>
    <div className="w-full mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Staff Appointments</h2>

      {/* Display the overall working hours range */}
      <p className="mb-4">
        <strong>Working Hours:</strong> {workingRangeDisplay}
      </p>

      {/* CSS to hide entire day columns with no working hours */}
      <style>
        {`
          ${nonWorkingDays.map((nth) => `.rbc-day-bg:nth-child(${nth}) { display: none; }`).join("\n")}
          ${customStyles}
        `}
      </style>

      

      <Calendar
        localizer={localizer}
        events={events}
        date={currentDate}
        onNavigate={handleNavigate}
        defaultView="week"
        views={["week", "day"]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600,width:"100%" }}
        step={60}
        timeslots={1}
        dayPropGetter={customDayPropGetter}
        onSelectSlot={handleSlotSelect} 
        onSelectEvent={handleEventSelect} 
        selectable={true}
        // Use the computed working range to limit the visible hours.
        min={workingRange.min}
        max={workingRange.max}
        eventPropGetter={eventStyleGetter}
      />
    </div>




    {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">New Appointment</h2>

            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />

            <label className="block text-sm font-medium mb-1">Client Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              value={newEvent.clientName}
              onChange={(e) => setNewEvent({ ...newEvent, clientName: e.target.value })}
            />

            <label className="block text-sm font-medium mb-1">Service Type</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              value={newEvent.serviceType}
              onChange={(e) => setNewEvent({ ...newEvent, serviceType: e.target.value })}
            />

            <label className="block text-sm font-medium mb-1">Charges</label>
            <input
              type="number"
              className="w-full p-2 border rounded mb-4"
              value={newEvent.charges}
              onChange={(e) => setNewEvent({ ...newEvent, charges: e.target.value })}
            />

            <div className="flex justify-end">
              <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSubmitEvent}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

{showEventDetailsModal && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>

            <p className="text-gray-700"><strong>Client:</strong> {selectedEvent.clientName}</p>
            <p className="text-gray-700"><strong>Service:</strong> {selectedEvent.serviceType}</p>
            <p className="text-gray-700"><strong>Charges:</strong> ${selectedEvent.serviceCharges}</p>
            <p className="text-gray-700">
              <strong>Time:</strong> {moment(selectedEvent.start).format("hh:mm A")} - {moment(selectedEvent.end).format("hh:mm A")}
            </p>

            <div className="flex justify-end mt-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDeleteEvent}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewStaffComp;

