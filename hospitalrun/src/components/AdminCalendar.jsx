import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css"; // Custom styles for beauty

const localizer = momentLocalizer(moment);

const AdminCalendar = () => {
    const [events, setEvents] = useState([
        {
            id: 1,
            title: "Opening Hours",
            start: new Date(),
            end: new Date(moment().add(1, "hours").toDate()),
        },
    ]);

    const handleSelectSlot = ({ start, end }) => {
        const title = prompt("Enter event title:");
        if (title) {
            setEvents([...events, { id: events.length + 1, title, start, end }]);
        }
    };

    const handleSelectEvent = (event) => {
        const action = window.confirm("Delete this event?");
        if (action) {
            setEvents(events.filter((e) => e.id !== event.id));
        }
    };

    return (
        <div className="calendar-container">
            <h2>Set Business Schedule</h2>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                views={["day", "week"]}
                defaultView="week"
                style={{ height: "80vh" }}
            />
        </div>
    );
};

export default AdminCalendar;
