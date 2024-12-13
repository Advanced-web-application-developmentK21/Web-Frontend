import React, { useState, useEffect } from "react";
import { Event } from "../../types/events";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import axios from "axios";

moment.locale("en-GB");
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(BigCalendar);

const allViews = Object.keys(Views)
  .filter((k) => k !== "WORK_WEEK")
  .map((k) => Views[k as keyof typeof Views]);

export default function Schedule() {
  const [showModal, setShowModal] = useState(false);
  const [modalEvent, setModalEvent] = useState<Event | null>(null);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showMoreEvents, setShowMoreEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:4000/task/getOptionTasks");
        const fetchedEvents = response.data.data.map((task: any) => {
          const startDate = moment.utc(task.startDate).local().toDate();
          const endDate = moment.utc(task.dueDate).local().toDate();

          if (task.allDay) {
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
          }

          return {
            id: task._id,
            title: task.name,
            desc: task.description,
            priority: task.priority,
            estimatedTime: task.estimatedTime,
            status: task.status,
            start: startDate,
            end: endDate,
            allDay: task.allDay || false,
          };
        });
        setCalendarEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleShowMore = (events: Event[]) => {
    setShowMoreEvents(events); // Store the events to show in the "Show More" modal
    setShowMoreModal(true);    // Show the "Show More" modal
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleEventDrop = async ({ event, start, end }: { event: Event; start: Date | string; end: Date | string }) => {
    // Update event's start and end dates in the local state
    const updatedEvents = calendarEvents.map((e) =>
      e.id === event.id ? { ...e, start: new Date(start), end: new Date(end) } : e
    );
    setCalendarEvents(updatedEvents);

    // Determine the new status based on the event's new date
    const newStartDate = moment(start);
    const newEndDate = moment(end);
    let newStatus = event.status;

    // Case 1: "Todo" -> "Expired" if moved to a past date
    if (event.status === "Todo" && newStartDate.isBefore(moment())) {
      newStatus = "Expired";
    }

    // Case 2: "In Progress" -> "Expired" if moved to a past date
    if (event.status === "In Progress" && newEndDate.isBefore(moment())) {
      newStatus = "Expired";
    }

    // Case 3: "Completed" -> "Expired" if moved to a past date
    if (event.status === "Completed" && newStartDate.isBefore(moment())) {
      newStatus = "Expired";
    }

    // Case 4: "Expired" -> stays "Expired"
    if (event.status === "Expired") {
      if (newStartDate.isAfter(moment()) || newEndDate.isAfter(moment())) {
          newStatus = "Todo"; // If moved to a future date, reset to "Todo"
      } else {
          newStatus = "Expired"; // Otherwise, remain "Expired"
      }
  }

    // Send the updated start, end dates and status to the backend
    try {
      await axios.put(`http://localhost:4000/task/updateTasks/${event.id}`, {
        status: newStatus,
        startDate: newStartDate.toISOString(),
        dueDate: newEndDate.toISOString(),
      });

      // Optionally, update the local event's status and dates
      const updatedEvent = updatedEvents.find((e) => e.id === event.id);
      if (updatedEvent) {
        updatedEvent.status = newStatus;
        updatedEvent.start = new Date(start);
        updatedEvent.end = new Date(end);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };


  const handleEventDoubleClick = (event: object, e: React.SyntheticEvent<HTMLElement>) => {
    const typedEvent = event as Event; // Cast the event to your custom Event type
    setModalEvent(typedEvent);         // Set the event details in the modal
    setShowModal(true);                // Show the modal
  };

  const handleEditEvent = (event: Event) => {
    // Logic to edit event (e.g., open a form with pre-filled values)
    console.log("Editing event:", event);
  };

  const handleDeleteEvent = (event: Event) => {
    // Logic to delete event
    axios
      .delete(`http://localhost:4000/task/deleteTask/${event.id}`)
      .then(() => {
        // Remove event from the state after deletion
        setCalendarEvents(calendarEvents.filter((e) => e.id !== event.id));
        setShowModal(false); // Close the modal
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100 py-10">
      <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-800">
        📅{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          Event Calendar
        </span>
      </h1>

      <div className="flex items-center justify-between px-5 mb-6">
        <div className="relative z-50 flex items-center space-x-3">
          <label htmlFor="date-picker" className="text-lg font-semibold text-gray-700">
            Select Month and Year:
          </label>
          <DatePicker
            id="date-picker"
            selected={currentDate}
            onChange={handleDateChange}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            className="p-3 border-2 border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg"
          />
        </div>

      </div>

      {loading ? (
        <div className="text-center text-gray-700">Loading events...</div>
      ) : (
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          <DndProvider backend={HTML5Backend}>
            <DragAndDropCalendar
              localizer={localizer}
              events={calendarEvents}
              step={30}
              views={allViews}
              date={currentDate}
              popup={false}
              onNavigate={handleNavigate}
              onEventDrop={({ event, start, end }) =>
                handleEventDrop({
                  event: event as Event,
                  start,
                  end,
                })
              }
              onShowMore={(events) => handleShowMore(events as Event[])} // Update this to show more events
              onDoubleClickEvent={handleEventDoubleClick}  // Double-click handler
              style={{ height: 600, borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
            />
          </DndProvider>
        </div>
      )}

      {/* Show More Events Modal */}
      {showMoreModal && showMoreEvents.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-11/12 md:w-1/2 lg:w-1/3 transform transition-all scale-95 max-h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">All Events</h2>
              <p className="text-sm text-gray-600">Here are all the events scheduled.</p>
            </div>

            <ul className="space-y-4">
              {showMoreEvents.map((event, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition"
                >
                  <span className="font-semibold text-gray-700 text-lg">{event.title}</span>
                  <span className="text-xs text-gray-500">
                    {moment(event.start).format("hh:mm A")} -{" "}
                    {moment(event.end).format("hh:mm A")}
                  </span>
                </li>
              ))}
            </ul>

            <button
              className="mt-6 w-full py-2 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow hover:opacity-90 transition"
              onClick={() => setShowMoreModal(false)}
            >
              Close
            </button>
          </div>
        </div>

      )}

      {showModal && modalEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl p-8 w-11/12 md:w-2/3 lg:w-1/2 transform transition-all scale-95 max-h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Event Details</h2>
              <p className="text-lg text-gray-600">Here are the details of your event.</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <p className="text-xl font-semibold text-gray-800">Title:</p>
                <p className="text-lg text-gray-600">{modalEvent.title}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xl font-semibold text-gray-800">Description:</p>
                <p className="text-lg text-gray-600">{modalEvent.desc}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xl font-semibold text-gray-800">Time:</p>
                <p className="text-lg text-gray-600">
                  {moment(modalEvent.start).format("hh:mm A")} - {moment(modalEvent.end).format("hh:mm A")}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xl font-semibold text-gray-800">Status:</p>
                <p className="text-lg text-gray-600">{modalEvent.status}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xl font-semibold text-gray-800">Priority:</p>
                <p className="text-lg text-gray-600">{modalEvent.priority}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xl font-semibold text-gray-800">Estimated Time:</p>
                <p className="text-lg text-gray-600">{modalEvent.estimatedTime}</p>
              </div>
            </div>

            <div className="flex justify-between space-x-6 mb-6">
              <button
                className="w-full py-3 bg-indigo-500 text-white rounded-lg shadow-lg hover:bg-indigo-600 transition"
                onClick={() => handleEditEvent(modalEvent)}
              >
                Edit Event
              </button>
              <button
                className="w-full py-3 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition"
                onClick={() => handleDeleteEvent(modalEvent)}
              >
                Delete Event
              </button>
            </div>

            <button
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg shadow-lg hover:bg-gray-300 transition"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
