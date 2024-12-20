import React, { createContext, useState, useEffect } from "react";
import "../../styles/FocusTimer.css";
import { DndProvider } from "react-dnd";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment-timezone";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { Event } from "../../types/events";



function FocusTimer() {
  const [Tasks, setTasks] = useState<Event[]>([]); // Array of tasks
  const [Cur_Task, setCur_Task] = useState<Event | null>(null);
  const [task, setTask] = useState<string>(""); // Selected task title
  const [session, setSession] = useState<number>(1); // Number of Session
  const [curSession, setCurSession] = useState<number>(1); // Current session
  const [duration, setDuration] = useState<number>(25); // Work duration in minutes
  const [breakDuration, setBreakDuration] = useState<number>(5); // Break duration in minutes
  const [timeLeft, setTimeLeft] = useState<number>(0); // Countdown in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false); // Toggle work/break

  const { setIsTimerRunning } = useAuth();

  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const Set_task = location.state?.schedule;
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/task/getOptionTasks/${userId}`);
        const fetchedEvents: Event[] = response.data.data.map((task: any) => {
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
        setTasks(fetchedEvents);

        // Check if Set_task exists in the fetched tasks and set it as the default task
        if (Set_task) {
          const matchingTask = fetchedEvents.find((t) => t.title === Set_task.title);
          console.log("Task already set!", matchingTask);
          if (matchingTask) {
            setTask(matchingTask.title);
            setCur_Task(Set_task);
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [userId, Set_task]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    //Check if the task deadline is met before the timer ends, end the timer immediately and notify the user.
    const currentTime = Date.now();
    const endTime = Cur_Task?.end ? new Date(Cur_Task.end).getTime() : undefined;
    if (endTime !== undefined) {
      const remainingTime = endTime - currentTime;
      if (remainingTime <= 0) {
        setIsRunning(false);
        setTimeLeft(0);
        setIsBreak(false);
        setIsTimerRunning(false);
        
        Swal.fire({
          icon: "warning",
          title: "TIME OUT!",
          html: "The task deadline has arrived.",
          confirmButtonText: "OK",
        });
        UpdateTask("Expired");
        setTask("");
        setCur_Task(null);
        return () => clearInterval(timer);
      }
    }

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false); // Pause timer temporarily
      
      const nextPhase = isBreak ? "work session" : "break";
      if (!isBreak && curSession < session) {
        Swal.fire({
          icon: "success", // Use "success" instead of "check-circle"
          title: `Session ${curSession} Completed!`,
          html: `Starting <b>${nextPhase}</b>.`,
          confirmButtonText: "Got it!",
        });

        // Switch to break session
        setTimeLeft(breakDuration * 60);
        setIsBreak(true);
        setIsRunning(true); // Restart timer
      } else if (curSession < session) {
        setCurSession(curSession + 1);
        Swal.fire({
          icon: "success", // More suitable icon for break ending
          title: "Break Time is Over!",
          html: `Starting session <b>${curSession + 1}</b>.`,
          confirmButtonText: "Let's go!",
        });

        // Switch to work session
        setTimeLeft(duration * 60);
        setIsBreak(false);
        setIsRunning(true); // Restart timer
      } else {
        setIsRunning(false);
        setTimeLeft(0);
        setIsBreak(false);
        setIsTimerRunning(false);
        Swal.fire({
          icon: "success", // Celebration icon for task completion
          title: "All Sessions Completed!",
          html: `All sessions are done. Task <b>${task}</b> is now completed!`,
          showCancelButton: true,
          confirmButtonText: "Mark as Completed",
          cancelButtonText: "Close",
        }).then((result) => {
          if (result.isConfirmed) {
            // Logic for marking the task as completed
            console.log(`Task "${task}" marked as completed.`);
            UpdateTask("Completed");
            setTask("");
            setCur_Task(null);
          }
        });
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreak, duration, breakDuration]);

  const startTimer = () => {
    const finalTask = task; // Use newTask if provided, else selected task
    if (!finalTask) {
      Swal.fire({
        icon: "error", // More suitable icon for break ending
        title: "NO TASK!",
        html: "Please select a task!",
        confirmButtonText: "OK",
      });
      return;
    }
    setCurSession(1);
    setTask(finalTask);
    setTimeLeft(duration * 60); // Convert minutes to seconds
    setIsRunning(true);
    setIsBreak(false);
    setIsTimerRunning(true); 
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsBreak(false);
    setIsTimerRunning(false);
  };

  // Cleanup when the session ends
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      //setIsRunning(false);
      //setIsTimerRunning(false); // Notify that the timer has stopped
    }
  }, [timeLeft, isRunning]);

  const UpdateTask = async (newStatus: "Completed" | "Todo" | "In Progress" | "Expired") => {
    if (!Cur_Task) {
      console.error("Cur_Task is null or undefined.");
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "No task selected to update.",
      });
      return;
    }
    const newEndDate = new Date(Date.now() - 1000); // Subtract 1000 ms (1 second)

    try {
      await axios.put(`http://localhost:4000/task/updateTasks/${Cur_Task.id}`, {
        status: newStatus,
        startDate: Cur_Task.start,
        dueDate: newEndDate.toISOString(),
      });
  
      // Optionally, update the local event's status and dates
      const updatedEvent = Tasks.find((e) => e.id === Cur_Task.id);
      if (updatedEvent) {
        updatedEvent.status = newStatus;
      }
    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";
  
      if (error.response) {
        console.error("Update error:", error.response.data);
        const errorData = error.response.data;
        errorMessage = errorData.message || errorMessage;
      } else {
        console.error("Update error:", error.message);
        errorMessage = error.message;
      }
  
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: errorMessage,
      });
    }
  };

  return (
    <div className="focus-timer-container">
      <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-800">
        ⏱️{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-green to-blue-600">
          FOCUS TIMER
        </span>
      </h1>
      <div className="task-controls">
        <select 
          value={task} 
          onChange={(e) => {
            const selectedTask = Tasks.find((t) => t.title === e.target.value); // Use find with a predicate
            console.log("Selected task's info: ", selectedTask);

            if (selectedTask && selectedTask.status === "In Progress") {
              setTask(e.target.value);
              setCur_Task(selectedTask);
            } else {
              Swal.fire({
                icon: "error", // More suitable icon for break ending
                title: "Task status is invalid!",
                html: "Please change the task status to <b>In Progress</b> first!",
                confirmButtonText: "OK",
              });
            }
          }} 
          disabled={isRunning}
        >
          <option value="">Select an Existing Task</option>
          {Tasks.map((t) => (
            <option key={t.id} value={t.title}>
              {t.title}
            </option>
          ))}
        </select>
        <div className="row">
            <label>
              Number Of Session:
            </label>
            <input
              type="number"
              placeholder="Number Of Session"
              value={session}
              onInput={(e) => {
                const value = e.currentTarget.value;
                // Allow only integers
                if (/^\d+$/.test(value)) {
                  setSession(Number(value));
                } else {
                  e.currentTarget.value = session.toString(); // Revert to the last valid value
                }
              }}
              min="1"
              step="1"
              disabled={isRunning}
            />
        </div>
        <div className="row">
          <label>
          Session Duration (minutes):
          </label>
          <input
            type="number"
            placeholder="Work Duration (minutes)"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="1"
            disabled={isRunning}
          />
        </div>
        <div className="row">
          <label>
          Break Duration (minutes):
          </label>
          <input
            type="number"
            placeholder="Break Duration (minutes)"
            value={breakDuration}
            onChange={(e) => setBreakDuration(Number(e.target.value))}
            min="1"
            disabled={isRunning}
          />
        </div>
        <div className="row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button className="start-button" onClick={startTimer} disabled={isRunning}>
            Start
          </button>
          <button className="stop-button" onClick={stopTimer} disabled={!isRunning}>
            Stop
          </button>
        </div>
        <button className="reset-button" onClick={resetTimer}>Reset</button>
      </div>
      <h1>{task || "No task selected"}</h1>
      <h2>
        {Cur_Task?.start
          ? `From ${new Date(Cur_Task.start).toLocaleDateString('en-US', {
              weekday: 'short',
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
            })} ${new Date(Cur_Task.start).toLocaleTimeString('en-US', {
              hour12: false,
            })}`
          : ""}
      </h2>

      <h2>
        {Cur_Task?.end 
          ? `To ${new Date(Cur_Task.end).toLocaleDateString('en-US', {
            weekday: 'short',
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          })} ${new Date(Cur_Task.end).toLocaleTimeString('en-US', {
            hour12: false,
          })}`
        : ""}
      </h2>

      <h3>
        {isBreak ? "Break Time" : "Work Time"} -{" "}
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </h3>
      {isRunning && (
        <div className="timer-bar">
          <div
            className="timer-progress"
            style={{
              width: `${((isBreak ? breakDuration : duration) * 60 - timeLeft) /
                ((isBreak ? breakDuration : duration) * 60) *
                100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default FocusTimer;
