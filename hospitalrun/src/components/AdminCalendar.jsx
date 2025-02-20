import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css"; 
import { useNavigate } from "react-router-dom";// Custom styles

const localizer = momentLocalizer(moment);

const dayToDay = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
const navigate = useNavigate()
  // ----------------------------------------------------------------
  // 1. Fetch schedule when component mounts
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchSchedule = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/workhours/get-schedule", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await res.json();
            if (res.ok && data.schedule) {
                setEvents(formatScheduleToEvents(data.schedule));
            } else {
                console.error("Error fetching schedule:", data.error || "No schedule found");
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    fetchSchedule();
}, []);


  // ----------------------------------------------------------------
  // 2. Convert stored schedule object into calendar events
  // ----------------------------------------------------------------
  const formatScheduleToEvents = (schedule) => {
    const loadedEvents = [];
    Object.keys(schedule).forEach((day) => {
      const timeRanges = schedule[day];
      if (timeRanges && timeRanges.length > 0) {
        timeRanges.forEach((timeRange) => {
          const [startStr, endStr] = timeRange.split(" - ");
          const start = moment().day(dayToDay[day]).set({
            hour: moment(startStr, "h:mm A").hour(),
            minute: moment(startStr, "h:mm A").minute(),
            second: 0,
            millisecond: 0,
          }).toDate();
          const end = moment().day(dayToDay[day]).set({
            hour: moment(endStr, "h:mm A").hour(),
            minute: moment(endStr, "h:mm A").minute(),
            second: 0,
            millisecond: 0,
          }).toDate();
          loadedEvents.push({
            id: `${day}-${startStr}-${endStr}`,
            title: "Working Hours",
            start,
            end,
          });
        });
      }
    });
    return loadedEvents;
  };

  // ----------------------------------------------------------------
  // 3. Convert events into a formatted schedule object
  // ----------------------------------------------------------------
  const getFormattedEvents = (currentEvents) => {
    const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const formatted = {};
    allDays.forEach(day => {
      formatted[day] = [];
    });

    currentEvents.forEach(event => {
      const day = moment(event.start).format("dddd");
      const startStr = moment(event.start).format("h:mm A");
      const endStr = moment(event.end).format("h:mm A");
      formatted[day].push(`${startStr} - ${endStr}`);
    });

    allDays.forEach(day => {
      if (formatted[day].length === 0) {
        formatted[day] = null;
      }
    });
    return formatted;
  };

  // ----------------------------------------------------------------
  // 4. PUT updated schedule to the backend (called when events change)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (events.length > 0) {
      updateSchedule(getFormattedEvents(events));
    }
  }, [events]);

  const updateSchedule = async (formattedSchedule) => {
    try {
        const res = await fetch("http://localhost:8080/api/workhours/update-schedule", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token
            },
            body: JSON.stringify({ schedule: formattedSchedule }),
        });

        const data = await res.json();
        if (res.status === 401) {
          navigate("/unauthorized", {
              state: { message: "Your token expired plz log back in" },
          });
          return false; // Prevent updating the schedule
      }
        
        if (res.status === 403) {
          navigate("/unauthorized", {
              state: { message: "You are not authorized to manage business hours" },
          });
          return false; // Prevent updating the schedule
      }

        if (!res.ok) {
            console.error("Error updating schedule:", data.error);
            return false;
        }

        return true; // Schedule update successful
    } catch (err) {
        console.error("PUT error:", err);
        return false;
    }
};


  // ----------------------------------------------------------------
  // 5. Check if selected time slot overlaps with any existing event
  // ----------------------------------------------------------------
  const isTimeSlotAvailable = (start, end) => {
    return !events.some(event =>
      moment(start).isBefore(event.end) && moment(end).isAfter(event.start)
    );
  };

  // ----------------------------------------------------------------
  // 6. Handle adding and removing events
  // ----------------------------------------------------------------
  const handleAddEvent = ({ start, end }) => {
    if (!isTimeSlotAvailable(start, end)) {
      alert("This time slot is already booked!");
      return;
    }
    setEvents(prevEvents => [...prevEvents, { id: prevEvents.length + 1, title: "Working Hours", start, end }]);
  };

  const handleDeleteEvent = (event) => {
    if (window.confirm("Delete this event?")) {
      setEvents(prevEvents => {
        const updatedEvents = prevEvents.filter(e => e.id !== event.id);
        
        // 🔴 Ensure schedule is sent even if events become empty
        updateSchedule(getFormattedEvents(updatedEvents));
  
        return updatedEvents;
      });
    }
  };
  
  // ----------------------------------------------------------------
  // 7. Render the Calendar
  // ----------------------------------------------------------------
  return (
    <div className="calendar-container">
      <h2>Set Business Schedule</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleAddEvent}
        onSelectEvent={handleDeleteEvent}
        views={["day", "week"]}
        defaultView="week"
        style={{ height: "80vh" }}
        formats={{
          dayFormat: (date) => moment(date).format("dddd"),
          timeGutterFormat: "h A",
        }}
        dayPropGetter={() => ({ style: { backgroundColor: "transparent" } })}
        showCurrentTimeIndicator={false}
        toolbar={false}
      />
    </div>
  );
};

export default AdminCalendar;
