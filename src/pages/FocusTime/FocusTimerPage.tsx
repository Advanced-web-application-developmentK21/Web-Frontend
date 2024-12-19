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



interface Task {
  id: string;
  title: string;
}

function FocusTimer() {
  const [Tasks, setTasks] = useState<Task[]>([]); // Array of tasks
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
        const fetchedEvents: Task[] = response.data.data.map((task: any) => ({
          id: task._id, // Match with your API response field names
          title: task.name,
        }));
        setTasks(fetchedEvents);

        // Check if Set_task exists in the fetched tasks and set it as the default task
        if (Set_task) {
          const matchingTask = fetchedEvents.find((t) => t.title === Set_task.title);
          console.log("Task already set!", matchingTask);
          if (matchingTask) {
            setTask(matchingTask.title);
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
        icon: "warning", // More suitable icon for break ending
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

  return (
    <div className="focus-timer-container">
      <h1>FOCUS TIMER WITH POMODORO</h1>
      <div className="task-controls">
        <select value={task} onChange={(e) => setTask(e.target.value)} disabled={isRunning}>
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
      <h2>{task || "No task selected"}</h2>
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
