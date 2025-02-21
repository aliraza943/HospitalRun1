import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale";
import { addHours, parse as parseDate } from "date-fns";
import { useNavigate } from "react-router-dom";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

// Helper to convert day name to a Date in the current week
const getDateForDay = (dayName, baseDate) => {
  const dayIndex = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ].indexOf(dayName);
  const start = startOfWeek(baseDate, { weekStartsOn: 0 });
  start.setDate(start.getDate() + dayIndex);
  return start;
};

// Parse a time string (e.g., "9:00 AM") to a Date using the baseDate for the day
const parseTimeToDate = (timeStr, baseDate) => {
  return parseDate(timeStr, "h:mm a", baseDate);
};

const MyCalendar = () => {
  const location = useLocation();
  const staff = location.state?.staff;
  const [schedule, setSchedule] = useState(null);
  const [missingEvents, setMissingEvents] = useState([]);
  const [workingEvents, setWorkingEvents] = useState([]);
  const [fetchedWorkingEvents, setFetchedWorkingEvents] = useState([]);
  const navigate = useNavigate();



  // Function to generate "missing" (non-working) event slots based on API schedule
  const generateMissingEvents = (apiSchedule) => {
    const baseDate = new Date(); // Reference for the current week
    const events = [];

    Object.entries(apiSchedule).forEach(([day, workingHours]) => {
      const dayDate = getDateForDay(day, baseDate);

      if (!workingHours) {
        // Block the entire day with a single event from 12:00 AM to 11:59 PM
        events.push({
          title: "Not working hours",
          start: parseTimeToDate("12:00 AM", dayDate),
          end: parseTimeToDate("11:59 PM", dayDate),
        });
        return;
      }

      // Parse and sort working hour slots by start time
      const sortedSlots = workingHours
        .map((slot) => {
          const [startStr, endStr] = slot.split(" - ");
          return {
            start: parseTimeToDate(startStr, dayDate),
            end: parseTimeToDate(endStr, dayDate),
          };
        })
        .sort((a, b) => a.start - b.start);

      // Check for gaps before, between, and after working hour slots
      let previousEnd = parseTimeToDate("12:00 AM", dayDate);
      sortedSlots.forEach((slot) => {
        if (slot.start > previousEnd) {
          events.push({
            title: "Not working hours",
            start: previousEnd,
            end: slot.start,
          });
        }
        previousEnd = slot.end > previousEnd ? slot.end : previousEnd;
      });

      // After the last slot until end of day (11:59 PM)
      const endOfDay = parseTimeToDate("11:59 PM", dayDate);
      if (previousEnd < endOfDay) {
        events.push({
          title: "Not working hours",
          start: previousEnd,
          end: endOfDay,
        });
      }
    });

    return events;
  };

  // Fetch schedule from the API on component mount
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/workhours/get-schedule", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token if required
          },
        });
  
        const data = await res.json();
        if (res.ok && data.schedule) {
          setSchedule(data.schedule);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
  
    fetchSchedule();
  }, []);
  

  useEffect(() => {
    const fetchStaffData = async () => {
      if (!staff?._id) return;

      try {
        const res = await fetch(`http://localhost:8080/api/staff/${staff._id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Check for unauthorized (401) or forbidden (403) responses
        if (res.status === 401) {
          navigate("/unauthorized", { state: { message: "Your token expired plz log out and log back in" } });
          return;
        }
        if (res.status === 403) {
          navigate("/unauthorized", { state: { message: "u dont have permissions to access this" } });
          return;
        }

        const data = await res.json();

        if (res.ok) {
          console.log("Staff Data:", data);
        } else {
          console.error("Error fetching staff data:", data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchStaffData();
  }, [staff, navigate]);
  // Update missing events when the schedule is loaded
  useEffect(() => {
    if (schedule) {
      const events = generateMissingEvents(schedule);
      setMissingEvents(events);
    }
  }, [schedule]);

  // Handler for selecting a slot by clicking and dragging on the calendar
  const handleSelectSlot = async (slotInfo) => {
    const { start, end } = slotInfo;
  
    if (!schedule || !staff?._id) {
      alert("Schedule or staff data not loaded.");
      return;
    }
  
    // Check for client-side overlaps
    const isOverlapping = events.some(
      (event) => start < event.end && end > event.start
    );
    if (isOverlapping) {
      alert("Time slot occupied.");
      return;
    }
  
    const title ="Working Event"
    if (!title || title !== "Working Event") return;
  
    try {
      const newEvent = { title, start, end };
      console.log("New working event created:", newEvent);
  
      // Update state and ensure the latest copy is used
      setWorkingEvents((prev) => {
        const updatedEvents = [...prev, newEvent];
        console.log("Updated working events:", updatedEvents);
  
        // Convert to the schedule format
        const updatedSchedule = mapEventsToSchedule(updatedEvents);
        console.log("Updated schedule:", updatedSchedule);
  
        return updatedEvents; // Ensure state is properly updated
      });
    } catch (err) {
      console.error("Error:", err);
      alert("Update failed. Check console for details.");
    }
  };
  
  // Function to format events into the desired structure
  const formatTime = (date) => {
    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };
  
  const mapEventsToSchedule = (events) => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const schedule = daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: null }), {});
  
    events.forEach(({ start, end }) => {
      const day = daysOfWeek[start.getDay()];
      const timeRange = `${formatTime(start)} - ${formatTime(end)}`;
  
      if (!schedule[day]) {
        schedule[day] = [timeRange];
      } else {
        schedule[day].push(timeRange);
      }
    });
  
    return schedule;
  };
  const handleSelectEvent = async (event) => {
    if (event.title !== "Working Event") return;
  
    const confirmDelete = window.confirm("Do you want to remove this working event?");
    if (!confirmDelete) return;
  
    setWorkingEvents((prevEvents) =>
      prevEvents.filter((e) => e.start !== event.start || e.end !== event.end)
    );
  
    setFetchedWorkingEvents((prevFetchedEvents) =>
      prevFetchedEvents.filter((e) => e.start !== event.start || e.end !== event.end)
    );
  
    try {
      await updateScheduleAPI(workingEvents); // Update the backend
      console.log("Event successfully removed and schedule updated.");
    } catch (error) {
      console.error("Failed to update after deleting event:", error);
    }
  };
  
  
  
  // Track changes in workingEvents using useEffect
  const updateScheduleAPI = async (combinedEvents, navigate) => {
    if (!staff?._id) {
      console.error("Staff ID is missing.");
      return;
    }
  
    // Convert combined events to the schedule format.
    const updatedSchedule = mapEventsToSchedule(combinedEvents);
    const apiUrl = `http://localhost:8080/api/staff/update-schedule/${staff._id}`;
  
    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token
        },
        body: JSON.stringify({ schedule: updatedSchedule }),
      });
  
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate("/unauthorized", {
            state: { message: "You are not authorized to modify the employee schedule." },
          });
          return;
        }
        throw new Error(`API error: ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log("Schedule successfully updated:", result);
    } catch (error) {
      console.error("Failed to update schedule:", error);
    }
  };
  
  
  // useEffect now depends on both workingEvents and fetchedWorkingEvents.
  // It combines them and sends the updated schedule to the backend.
  useEffect(() => {
    const combinedEvents = [...workingEvents, ...fetchedWorkingEvents];
    if (combinedEvents.length > 0) {
      updateScheduleAPI(combinedEvents,navigate);
    }
  }, [workingEvents, fetchedWorkingEvents]);
  useEffect(() => {
    const fetchWorkingEvents = async () => {
      console.log("THE STAFF ID IS", staff._id);
      try {
        const res = await fetch(`http://localhost:8080/api/staff/schedule/${staff._id}`);
        const data = await res.json();
        console.log("THIS WAS THE DATA", data.schedule);
  
        if (res.ok && data.schedule) {
          const baseDate = new Date();
          const formattedEvents = Object.entries(data.schedule) // Convert object to an array
            .flatMap(([day, slots]) => {
              if (!slots || slots.length === 0) return []; // Skip null or empty slots
  
              const dayDate = getDateForDay(day, baseDate);
              return slots.map((slot) => {
                const [startStr, endStr] = slot.split(" - ");
                return {
                  title: "Working Event",
                  start: parseTimeToDate(startStr, dayDate),
                  end: parseTimeToDate(endStr, dayDate),
                };
              });
            });
  
          setFetchedWorkingEvents(formattedEvents);
        }
      } catch (err) {
        console.error("Error fetching working events:", err);
      }
    };
  
    fetchWorkingEvents();
  }, []);
  

  
  // Combine missing and working events for display on the calendar.
  const events = [...missingEvents, ...workingEvents,...fetchedWorkingEvents];

  return (
    <div>
      <h1>Schedule for {staff?.name || "Staff Member"}</h1>

      {/* Display list of working events */}
      

      {/* Inline CSS to override default react-big-calendar styles */}
      <style>{`
        .rbc-event {
          background-color: transparent !important;
        }
        .not-working-event {
          background-color: #d3d3d3 !important;
          border-radius: 4px;
          color: #000 !important;
          border: none;
          padding: 5px;
        }
        .working-event {
          background-color: #0080ff !important;
          border-radius: 4px;
          color: #000 !important;
          border: none;
          padding: 5px;
        }
      `}</style>

      <Calendar
        localizer={localizer}
        events={events}
        defaultView="week"
        views={["week"]}
        step={60}
        timeslots={1}
        onSelectEvent={handleSelectEvent}
        selectable
        onSelectSlot={handleSelectSlot}
        formats={{
          dayFormat: "EEEE",
          timeGutterFormat: "ha",
        }}
        style={{ height: 600 }}
        eventPropGetter={(event) => {
          const isMissing = event.title === "Not working hours";
          const backgroundColor = isMissing ? "#d3d3d3" : "#0080ff";
          return {
            style: {
              backgroundColor,
              borderRadius: "4px",
              color: "#000",
              border: "none",
              padding: "5px",
            },
            className: isMissing ? "not-working-event" : "working-event",
          };
        }}
      />
    </div>
  );
};

export default MyCalendar;
