import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import EventEditDetails from "./EventEditDetails";
import NewAppointmentModal from "./NewAppointmentModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// If not already configured in your root component, you can call toast.configure()
// toast.configure();

const localizer = momentLocalizer(moment);

const ViewStaffComp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const staff = location.state?.staff;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timeRange, setTimeRange] = useState({ min: "09:00", max: "18:00" });
  const [workingHours, setWorkingHours] = useState({});
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
      console.log(data);
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
      toast.error("No working hours for this day.");
      return;
    }

    let isWithinWorkingHours = false;
    workingSlots.forEach((slot) => {
      const [startStr, endStr] = slot.split(" - ");
      const slotStart = moment(
        selectedStartUTC.format("YYYY-MM-DD") + " " + startStr,
        "YYYY-MM-DD h:mm A"
      ).utc();
      const slotEnd = moment(
        selectedStartUTC.format("YYYY-MM-DD") + " " + endStr,
        "YYYY-MM-DD h:mm A"
      ).utc();

      if (
        selectedStartUTC.isBetween(slotStart, slotEnd, null, "[)") &&
        selectedEndUTC.isBetween(slotStart, slotEnd, null, "(]")
      ) {
        isWithinWorkingHours = true;
      }
    });

    if (!isWithinWorkingHours) {
      toast.error("Selected slot is outside working hours.");
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
      toast.error("This time slot is already occupied. Please select a different time.");
      return;
    }

    setNewEvent({ ...newEvent, start, end });
    setShowModal(true);
  };

  const handleSubmitEvent = async () => {
    if (!newEvent.title || !newEvent.clientName || !newEvent.serviceType || !newEvent.charges) {
      toast.error("Please fill all fields.");
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
      toast.error("This time slot is already occupied. Please select a different time.");
      return;
    }

    const appointmentData = {
      staffId: staff._id,
      title: newEvent.title,
      clientName: newEvent.clientName,
      serviceType: newEvent.serviceType,
      charges: newEvent.charges,
      start: formattedStartUTC.toDate(),
      end: formattedEndUTC.toDate(),
      clientId: newEvent.clientId,
      serviceId:newEvent.serviceId,
      description:newEvent.description
    };

    try {
      const response = await fetch("http://localhost:8080/api/staff/appointments/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.status === 401) {
        navigate("/unauthorized", {
          state: { message: "Your token expired plz log out and log back in" },
        });
        return;
      }

      if (response.status === 403) {
        navigate("/unauthorized", {
          state: { message: "u dont have permissions to access this" },
        });
        return;
      }

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
        setShowModal(false);
      } else {
        console.error("Error adding appointment:", response.statusText);
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

  const nonWorkingDays = Object.entries(staff?.workingHours || {})
    .filter(([_, hours]) => hours === null)
    .map(([day]) => dayNameToIndex[day] + 1);

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

  const workingRange = useMemo(() => {
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

  const handleEventSelect = (event) => {
    if (event.title === "Non Working Hours") return;
    setSelectedEvent(event);
    console.log("THIS EVENT", event);
    setShowEventDetailsModal(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch("http://localhost:8080/api/staff/appointments/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  const generateNonWorkingEventsForDay = (day, workingSlots, dayMin, dayMax) => {
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

    const intervals = workingSlots.map((slot) => {
      const [startStr, endStr] = slot.split(" - ");
      const startTime = moment(day.format("YYYY-MM-DD") + " " + startStr, "YYYY-MM-DD h:mm A");
      const endTime = moment(day.format("YYYY-MM-DD") + " " + endStr, "YYYY-MM-DD h:mm A");
      return { start: startTime, end: endTime };
    });

    intervals.sort((a, b) => a.start - b.start);

    const nonWorkingEvents = [];
    if (intervals.length > 0 && dayStart.isBefore(intervals[0].start)) {
      nonWorkingEvents.push({
        title: "Non Working Hours",
        start: dayStart.toDate(),
        end: intervals[0].start.toDate(),
      });
    }
    for (let i = 0; i < intervals.length - 1; i++) {
      if (intervals[i].end.isBefore(intervals[i + 1].start)) {
        nonWorkingEvents.push({
          title: "Non Working Hours",
          start: intervals[i].end.toDate(),
          end: intervals[i + 1].start.toDate(),
        });
      }
    }
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
    const startOfWeek = moment(currentDate).startOf("week");
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

  const nonWorkingEvents = useMemo(() => (staff ? generateNonWorkingEvents() : []), [staff, currentDate, workingRange]);
  const events = useMemo(() => {
    if (!staff) return [];

    const formattedAppointments = appointments.map((appointment) => ({
      ...appointment,
      title: appointment.title || "Booked Appointment",
      start: moment(appointment.start).toDate(),
      end: moment(appointment.end).toDate(),
      clientName: appointment.clientName,
      serviceType: appointment.serviceType,
      serviceCharges: appointment.serviceCharges,
    }));

    return [...formattedAppointments, ...nonWorkingEvents];
  }, [staff, appointments, nonWorkingEvents]);

  const workingRangeDisplay = `${moment(workingRange.min).format("h:mm A")} - ${moment(workingRange.max).format("h:mm A")}`;
  const eventStyleGetter = (event) => {
    if (event.title === "Non Working Hours") {
      return {
        className: "non-working-hours",
        style: {
          backgroundColor: "#808080 !important",
          color: "#fff",
          borderRadius: "0px",
          border: "none",
          opacity: 1,
          pointerEvents: "none",
          cursor: "default",
        },
      };
    }
    return {
      className: "working-appointment",
      style: {
        backgroundColor: "#3174ad !important",
        color: "white",
        borderRadius: "5px",
        border: "none",
      },
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

  const handleUpdateEvent = async () => {
    console.log("THIS EVENT WAS TRIGGERED");
    if (!selectedEvent) return;

    console.log("The data being set", selectedEvent);

    try {
      const startUTC = new Date(selectedEvent.start).toISOString();
      const endUTC = new Date(selectedEvent.end).toISOString();

      const response = await fetch(`http://localhost:8080/api/staff/appointments/${selectedEvent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: selectedEvent.clientName,
          clientName: selectedEvent.clientName,
          serviceType: selectedEvent.serviceType,
          serviceCharges: selectedEvent.serviceCharges,
          date: new Date(selectedEvent.start).toISOString().split("T")[0],
          start: startUTC,
          end: endUTC,
          staffId: selectedEvent.staffId,
          clientId: selectedEvent.clientId,
          description:selectedEvent.description
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Appointment updated successfully!");
        fetchAppointments();
        setShowEventDetailsModal(false);
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update the appointment.");
    }
  };

  const handleCancelNewAppointment = () => {
    setShowModal(false);
    setNewEvent({
      title: "",
      clientName: "",
      serviceType: "",
      charges: "",
      start: null,
      end: null,
    });
  };

  const isAllDaysNull = Object.values(staff?.workingHours || {}).every((day) => day === null);
  return (
    <>
      {isAllDaysNull ? (
        <div className="w-full mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-center text-gray-500">
            The working hours of this employee are not set.
          </h2>
        </div>
      ) : (
        <div className="w-full mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>
          <p className="mb-4">
            <strong>Working Hours:</strong> {workingRangeDisplay}
          </p>
          <style>
            {`
              ${nonWorkingDays.map((nth) => `.rbc-day-bg:nth-child(${nth}) { display: none; }`).join("\n")}
              ${customStyles}
            `}
          </style>
          <div style={{ pointerEvents: showModal || showEventDetailsModal ? "none" : "auto" }}>
            <Calendar
              localizer={localizer}
              events={events}
              date={currentDate}
              onNavigate={handleNavigate}
              defaultView="week"
              views={["week", "day"]}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600, width: "100%" }}
              step={10}
              timeslots={3}
              dayPropGetter={customDayPropGetter}
              onSelectSlot={handleSlotSelect}
              onSelectEvent={handleEventSelect}
              selectable={true}
              min={workingRange.min}
              max={workingRange.max}
              eventPropGetter={eventStyleGetter}
            />
          </div>
        </div>
      )}
      {showModal && (
        <NewAppointmentModal
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          handleSubmitEvent={handleSubmitEvent}
          onCancel={handleCancelNewAppointment}
          staff={staff}
        />
      )}
      {showEventDetailsModal && selectedEvent && (
        <EventEditDetails
          showEventDetailsModal={showEventDetailsModal}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          setShowEventDetailsModal={setShowEventDetailsModal}
          handleUpdateEvent={handleUpdateEvent}
          handleDeleteEvent={handleDeleteEvent}
          workingHours={staff.workingHours}
          staffservices={staff.services}
          staff={staff}
        />
      )}
    </>
  );
};

export default ViewStaffComp;
