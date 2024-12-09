"use client";

import React, { useState } from "react";
import events, { Event } from "../../types/events";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import styles for the date picker
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

moment.locale("en-GB");
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(BigCalendar);

const allViews = Object.keys(Views)
  .filter((k) => k !== "WORK_WEEK" && k !== "AGENDA")
  .map((k) => Views[k as keyof typeof Views]);

export default function Schedule() {
  const [showModal, setShowModal] = useState(false);
  const [modalEvents, setModalEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<Event[]>(events); // Maintain the current events state

  const handleShowMore = (events: Event[]) => {
    setModalEvents(events);
    setShowModal(true);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleEventDrop = ({
    event,
    start,
    end,
  }: {
    event: Event; // Ensure the event is of type Event
    start: Date | string;
    end: Date | string;
  }) => {
    // Handle event drop logic
    const updatedEvents = calendarEvents.map((e) =>
      e.id === event.id
        ? { ...e, start: new Date(start), end: new Date(end) }
        : e
    );
    setCalendarEvents(updatedEvents);
  };  
  
  const handleShowAllEvents = () => {
    setModalEvents(calendarEvents);
    setShowModal(true);
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

        <button
          onClick={handleShowAllEvents}
          className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md hover:opacity-90 transition"
        >
          Show All Events
        </button>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <DndProvider backend={HTML5Backend}>
          <DragAndDropCalendar
            localizer={localizer}
            events={calendarEvents}
            step={60}
            views={allViews}
            date={currentDate}
            popup={false}
            onNavigate={handleNavigate}
            onEventDrop={({ event, start, end }) =>
              handleEventDrop({
                event: event as Event, // Type assertion to Event
                start,
                end,
              })
            }            
            onShowMore={(events) => handleShowMore(events as Event[])}
            style={{ height: 600, borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
          />
        </DndProvider>
      </div>

      {showModal && (
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
              {modalEvents.map((event, index) => (
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
