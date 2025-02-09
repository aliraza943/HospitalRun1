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
  useEffect(() => {
    fetchAppointments();
  }, [staff]);


  const fetchAppointments = async () => {
    if (!staff) return;
    try {
      const response = await fetch(`http://localhost:8080/api/staff/appointments/${staff._id}`);
      const data = await response.json();
      if (response.ok) {
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };


  const handleSlotSelect = async (slotInfo) => {
    console.log(slotInfo);
    const { start, end } = slotInfo;
    if (!staff) return;
  
    // Check for overlapping events with both appointments and non-working hours
    const isOverlapping = appointments.some((appointment) => {
      const appointmentStart = new Date(appointment.start);
      const appointmentEnd = new Date(appointment.end);
      const newStart = new Date(start);
      const newEnd = new Date(end);

      return (
        // Case 1: New event starts during an existing appointment
        (newStart >= appointmentStart && newStart < appointmentEnd) ||
        // Case 2: New event ends during an existing appointment
        (newEnd > appointmentStart && newEnd <= appointmentEnd) ||
        // Case 3: New event completely contains an existing appointment
        (newStart <= appointmentStart && newEnd >= appointmentEnd) ||
        // Case 4: New event is completely contained within an existing appointment
        (newStart >= appointmentStart && newEnd <= appointmentEnd)
      );
    });

    // Also check if the slot overlaps with non-working hours
    const isInNonWorkingHours = nonWorkingEvents.some((nonWorking) => {
      const nonWorkingStart = new Date(nonWorking.start);
      const nonWorkingEnd = new Date(nonWorking.end);
      const newStart = new Date(start);
      const newEnd = new Date(end);

      return (
        (newStart >= nonWorkingStart && newStart < nonWorkingEnd) ||
        (newEnd > nonWorkingStart && newEnd <= nonWorkingEnd) ||
        (newStart <= nonWorkingStart && newEnd >= nonWorkingEnd)
      );
    });
  
    if (isOverlapping) {
      alert("This time slot is already booked. Please select a different time.");
      return;
    }

    if (isInNonWorkingHours) {
      alert("This time slot is outside of working hours. Please select a different time.");
      return;
    }
  
    // Ask for the title of the event
    const eventTitle = prompt("Enter the title for the event:");
    if (!eventTitle) return; // Cancel if the user didn't enter a title
  
    const formattedStart = moment(start).format("YYYY-MM-DD HH:mm");
    const formattedEnd = moment(end).format("YYYY-MM-DD HH:mm");
  
    const newAppointment = {
      staffId: staff._id,
      start: formattedStart,
      end: formattedEnd,
      title: eventTitle,
    };
  
    try {
      const response = await fetch("http://localhost:8080/api/staff/appointments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppointment),
      });
  
      if (response.ok) {
        const newAppointments = [...appointments, newAppointment];
        setAppointments(newAppointments); // Update state immediately
        fetchAppointments(); // Fetch from backend as well
      }
    } catch (error) {
      console.error("Error adding appointment:", error);
    }
  }
  
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
  const handleEventSelect = async (event) => {
    if (event.title === "Non Working Hours") return; // Prevent deletion of non-working hours
  
    const confirmDelete = window.confirm(`Do you want to delete this appointment: "${event.title}"?`);
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(`http://localhost:8080/api/staff/appointments/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: staff._id, start: event.start, end: event.end }),
      });
  
      if (response.ok) {
        alert("Appointment deleted successfully!");
        fetchAppointments(); // Refresh appointments after deletion
      } else {
        alert("Failed to delete the appointment.");
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
      title: appointment.title || "Booked Appointment",
      start: moment(appointment.start).toDate(),
      end: moment(appointment.end).toDate(),
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
  );
};

export default ViewStaffComp;

