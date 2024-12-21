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
import { FaCheckCircle, FaClipboardList, FaExclamationTriangle } from "react-icons/fa";
import Swal from "sweetalert2";

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
  const [analyze_loading, setAnalyzeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [FeedbackModal, setFeedbackModal] = useState(false);
  const [Feedback, setFeedback] = useState<{
    keyIssues: { title: string; content: string }[];
  } | null>(null);

  const userId = localStorage.getItem("userId");

  // Handle feedback parsing and update state
  function parseFeedback(rawText: string) {
    const lines = rawText.split('\n'); // Split the text by newline
    let keyIssues: { title: string; content: string }[] = [];
    let currentTitle = "";
    let currentContent: string[] = [];
    let insideList = false; // To track if inside a numbered or bullet list

    // Iterate through each line
    lines.forEach(line => {
      // Check if the line starts with "**" to capture titles
      const titleMatch = line.match(/^\*\*([^*]+)\*\*/); // Match bold title

      if (titleMatch) {
        // If we already have content for a previous title, save it
        if (currentContent.length > 0) {
          keyIssues.push({
            title: `**${currentTitle.trim()}**`, // Bold title
            content: currentContent.join('\n').trim(),
          });
        }

        // Set the new title and reset the content array
        currentTitle = titleMatch[1];
        currentContent = [];
        insideList = false; // Reset list tracking
      } else if (line.match(/^\d+\./) || line.match(/^\* /)) {
        // Check if the line is part of a numbered list or bullet list
        if (!insideList) {
          insideList = true;
        }
        currentContent.push(line.trim()); // Add the list item content
      } else if (line.trim() !== "") {
        // Add any other regular content
        currentContent.push(line.trim());
      }
    });

    // Push the last title and content if there was any content
    if (currentContent.length > 0) {
      keyIssues.push({
        title: `**${currentTitle.trim()}**`, // Bold title
        content: currentContent.join('\n').trim(),
      });
    }
    return { keyIssues };
  }


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/task/getOptionTasks/${userId}`);
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
        Swal.fire({
          icon: "success",
          title: "Update Task Successful!",
          text: "You can check task now.",
          timer: 2000,
          showConfirmButton: false,
        });
        updatedEvent.status = newStatus;
        updatedEvent.start = new Date(start);
        updatedEvent.end = new Date(end);
      }
    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";

      if (error.response) {
        console.error("Sign up error:", error.response.data);
        const errorData = error.response.data;
        errorMessage = errorData.message || errorMessage;
      } else {
        console.error("Sign up error:", error.message);
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Sign Up Failed",
        text: errorMessage,
      });
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

  const handleAnalyze = async () => {
    setAnalyzeLoading(true);
    setError(null);
    setFeedback(null);

    console.log('Tasks: ', calendarEvents);
    try {
      const response = await axios.post(`http://localhost:4000/task/analyze-schedule`, {
        calendarEvents,
      });

      console.log('Frontend received data:', response.data);
      const parsedFeedback = parseFeedback(response.data.feedback); // Parse the feedback into structured data
      setFeedback(parsedFeedback);
      setFeedbackModal(true);
    } catch (error) {
      console.error('Error analyzing schedule:', error);
      setError('Failed to analyze schedule. Please try again later.');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100 py-10">
      <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-800">
        📅{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          Task Calendar
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
          <button
            onClick={handleAnalyze}
            disabled={analyze_loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: analyze_loading ? 'not-allowed' : 'pointer',
            }
            }>
            {analyze_loading ? 'Analyzing...' : 'Analyze Schedule'}
          </button>
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

      {/* Show Feedback Modal */}
      {FeedbackModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setFeedbackModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-8 w-11/12 md:w-2/3 lg:w-1/2 transform transition-all scale-95 max-h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-800 mb-4">AI Feedback</h2>
              <p className="text-lg text-gray-600">Here are the feedback about your schedules.</p>
            </div>

            <div className="space-y-6 mb-6">
              {Feedback?.keyIssues.map((issue, index) => {

                
                // Check if the issue title is empty, if it is return null for that iteration
                if (!issue.title.trim()) return null;
                
                // Check for specific titles and apply the custom box styling
                if (issue.title.trim() === '**Warnings:**' || issue.title.trim() === '**Problems:**') {
                  return (
                    <div key={index} className="bg-yellow-50 p-4 rounded-lg shadow-md">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                        <FaExclamationTriangle className="text-yellow-500 mr-2" />
                        <span className="text-yellow-500 mr-2">
                          {issue.title.replace(/\*\*/g, '')}
                        </span>
                      </h3>

                      {/* Iterate over each line of the content */}
                      {issue.content.split('\n').map((line, lineIndex) => {
                        // Clean the line by removing asterisks, stars, etc.
                        const cleanLine = line
                          .replace(/\*\*/g, '')  // Remove bold markers (**)
                          .replace(/\*/g, '')    // Remove italic markers (*)
                          .replace(/^\*\*\*\*/g, '') // Remove four asterisks (****)
                          .trim(); // Remove any extra leading/trailing whitespace

                        const isBullet = cleanLine.startsWith('•');
                        const isNumbered = /^\d+\./.test(cleanLine);

                        return (
                          <p key={lineIndex} style={{ margin: '0.5rem 0' }}>
                            {/* Handle bullets */}
                            {isBullet && <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>•</span>}
                            
                            {/* Handle numbered list */}
                            {!isNumbered && cleanLine && (
                              <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
                                {lineIndex + 1}.
                              </span>
                            )}
                            
                            {/* Display clean content */}
                            <span>{cleanLine}</span>
                          </p>
                        );
                      })}
                    </div>
                  );
                } else if (issue.title.trim() === '**Prioritization Recommendations:**' || issue.title.trim() === '**Recommendations:**') {
                  return (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg shadow-md">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                        <FaClipboardList className="text-blue-500 mr-2" />
                        <span className="text-blue-500 mr-2">
                          {issue.title.replace(/\*\*/g, '')}
                        </span> 
                      </h3>
                      {/* Iterate over each line of the content */}
                      {issue.content.split('\n').map((line, lineIndex) => {
                        // Clean the line by removing asterisks, stars, etc.
                        const cleanLine = line
                          .replace(/\*\*/g, '')  // Remove bold markers (**)
                          .replace(/\*/g, '')    // Remove italic markers (*)
                          .replace(/^\*\*\*\*/g, '') // Remove four asterisks (****)
                          .trim(); // Remove any extra leading/trailing whitespace

                        const isBullet = cleanLine.startsWith('•');
                        const isNumbered = /^\d+\./.test(cleanLine);

                        return (
                          <p key={lineIndex} style={{ margin: '0.5rem 0' }}>
                            {/* Handle bullets */}
                            {isBullet && <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>•</span>}
                            
                            {/* Handle numbered list */}
                            {!isNumbered && cleanLine && (
                              <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
                                {lineIndex + 1}.
                              </span>
                            )}
                            
                            {/* Display clean content */}
                            <span>{cleanLine}</span>
                          </p>
                        );
                      })}
                    </div>
                  );
                } else if (issue.title.trim() === '**Simple Steps to Fix:**') {
                  return (
                    <div key={index} className="bg-green-50 p-4 rounded-lg shadow-md">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        <span className="text-green-500 mr-2">
                        {issue.title.replace(/\*\*/g, '')}
                        </span>
                      </h3>
                      {/* Iterate over each line of the content */}
                      {issue.content.split('\n').map((line, lineIndex) => {
                        // Clean the line by removing asterisks, stars, etc.
                        const cleanLine = line
                          .replace(/\*\*/g, '')  // Remove bold markers (**)
                          .replace(/\*/g, '')    // Remove italic markers (*)
                          .replace(/^\*\*\*\*/g, '') // Remove four asterisks (****)
                          .trim(); // Remove any extra leading/trailing whitespace

                        const isBullet = cleanLine.startsWith('•');
                        const isNumbered = /^\d+\./.test(cleanLine);

                        return (
                          <p key={lineIndex} style={{ margin: '0.5rem 0' }}>
                            {/* Handle bullets */}
                            {isBullet && <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>•</span>}
                            
                            {/* Handle numbered list */}
                            {!isNumbered && cleanLine && (
                              <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
                                {lineIndex + 1}.
                              </span>
                            )}
                            
                            {/* Display clean content */}
                            <span>{cleanLine}</span>
                          </p>
                        );
                      })}
                    </div>
                  );
                } return (
                  <div key={index}>
                    {/* Render the title with or without bold markers */}
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>
                      {issue.title.replace(/\*\*/g, '')}
                    </h3>

                    <div style={{ paddingLeft: '1.5rem', lineHeight: '1.5' }}>
                      {/* Check if the title is empty to avoid numbering content */}
                      {issue.title.trim() !== "****" && (
                        issue.content.split('\n').map((line, lineIndex) => {
                          // Clean the line by removing asterisks, stars, etc.
                          const cleanLine = line
                            .replace(/\*\*/g, '')  // Remove bold markers (**)
                            .replace(/\*/g, '')    // Remove italic markers (*)
                            .replace(/^\*\*\*\*/g, '') // Remove four asterisks (****)
                            .trim(); // Remove any extra leading/trailing whitespace

                          const isBullet = cleanLine.startsWith('•');
                          const isNumbered = /^\d+\./.test(cleanLine);
                          
                          return (
                            <p key={lineIndex} style={{ margin: '0.5rem 0' }}>
                              {/* Handle bullets */}
                              {isBullet && <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>•</span>}
                              
                              {/* Handle numbered list but only if it doesn't already have numbering */}
                              {!isNumbered && cleanLine && (
                                <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
                                  {lineIndex + 1}.
                                </span>
                              )}
                              
                              {/* Display clean content */}
                              <span>{cleanLine}</span>
                            </p>
                          );
                        })
                      )}

                      {/* If the title is empty, display the content without numbering */}
                      {issue.title.trim() === "****" && (
                        issue.content.split('\n').map((line, lineIndex) => {
                          // Clean the line by removing asterisks, stars, etc.
                          const cleanLine = line
                            .replace(/\*\*/g, '')  // Remove bold markers (**)
                            .replace(/\*/g, '')    // Remove italic markers (*)
                            .replace(/^\*\*\*\*/g, '') // Remove four asterisks (****)
                            .trim(); // Remove any extra leading/trailing whitespace

                          return (
                            <span key={lineIndex}>{cleanLine}</span> // Render the cleaned line
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close Button*/}
            <button
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg shadow-lg hover:bg-gray-300 transition"
              onClick={() => setFeedbackModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
