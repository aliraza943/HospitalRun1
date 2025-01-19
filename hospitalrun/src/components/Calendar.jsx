import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const events = [
        {
            title: "Sample Event",
            start: new Date(2025, 0, 30, 10, 0),
            end: new Date(2025, 0, 30, 12, 0),
        },
    ];

    return (
        <div style={{ height: "500px", marginTop: '40px' }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                views={["day", "week", "month"]}
                step={60}
                timeslots={1}
                style={{ height: "100%" }}
            />
        </div>
    );
};

export default MyCalendar;
