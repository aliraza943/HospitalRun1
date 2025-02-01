import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale";
import { Modal, Button, Alert } from "react-bootstrap";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const MyCalendar = () => {
    const [events, setEvents] = useState([
        {
            title: "Lunch Break",
            start: new Date(2025, 0, 20, 13, 0),
            end: new Date(2025, 0, 20, 14, 0),
            status: "blocked",
        },
        {
            title: "Haircut - John Doe",
            start: new Date(2025, 0, 20, 11, 0),
            end: new Date(2025, 0, 20, 12, 0),
            status: "appointment",
        },
    ]);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [warning, setWarning] = useState(false);

    const handleSelectSlot = (slotInfo) => {
        const startHour = slotInfo.start.getHours();
        if (startHour < 10 || startHour >= 17) {
            setWarning(true);
        }
        setSelectedSlot(slotInfo);
        setModalOpen(true);
    };

    const handleSelectEvent = (event) => {
        alert(`Opening appointment: ${event.title}`);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setWarning(false);
    };

    return (
        <div>
            <h1>Employee Schedule</h1>
            <Calendar
                localizer={localizer}
                events={events}
                defaultView="week"
                views={["week"]}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                min={new Date(2025, 0, 20, 9, 0)} // Business hours start
                max={new Date(2025, 0, 20, 21, 0)} // Business hours end
                style={{ height: 600 }}
            />
            {modalOpen && (
                <Modal show onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {warning ? "Non-Working Hours Warning" : "New Appointment"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {warning && (
                            <Alert variant="warning">
                                This time slot is outside of working hours.
                            </Alert>
                        )}
                        <p>
                            Selected time: {format(selectedSlot.start, "hh:mm a")} -{" "}
                            {format(selectedSlot.end, "hh:mm a")}
                        </p>
                        {/* Add form elements for appointment creation here */}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                // Logic to add an appointment
                                setModalOpen(false);
                            }}
                        >
                            Save Appointment
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default MyCalendar;
