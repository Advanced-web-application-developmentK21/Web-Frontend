import React, { useState, useEffect } from "react";
import "../../styles/FocusTimer.css";

function FocusTimer() {
  const [taskList, setTaskList] = useState<string[]>([
    "Write report",
    "Study React",
    "Prepare presentation",
    "Exercise",
  ]); // Placeholder tasks
  const [task, setTask] = useState<string>("");
  const [newTask, setNewTask] = useState<string>(""); // For custom task input
  const [duration, setDuration] = useState<number>(25); // Work duration in minutes
  const [breakDuration, setBreakDuration] = useState<number>(5); // Break duration in minutes
  const [timeLeft, setTimeLeft] = useState<number>(0); // Countdown in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false); // Toggle work/break

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false); // Pause timer temporarily
      const nextPhase = isBreak ? "work session" : "break";
      alert(`Session completed! Starting ${nextPhase}.`);
      if (!isBreak) {
        // Switch to break session
        setTimeLeft(breakDuration * 60);
        setIsBreak(true);
        setIsRunning(true); // Restart timer
      } else {
        // Switch to work session
        setTimeLeft(duration * 60);
        setIsBreak(false);
        setIsRunning(true); // Restart timer
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreak, duration, breakDuration]);

  const startTimer = () => {
    const finalTask = newTask.trim() || task; // Use newTask if provided, else selected task
    if (!finalTask) {
      alert("Please select or enter a task!");
      return;
    }
    if (newTask.trim() && !taskList.includes(newTask.trim())) {
      setTaskList((prev) => [...prev, newTask.trim()]); // Add new task to the list
    }
    setTask(finalTask);
    setTimeLeft(duration * 60); // Convert minutes to seconds
    setIsRunning(true);
    setIsBreak(false);
  };

  const saveTask = () => {
    const trimmedTask = newTask.trim();
    if (trimmedTask && !taskList.includes(trimmedTask)) {
      setTaskList((prev) => [...prev, trimmedTask]); // Add new task to the list
      setNewTask(""); // Clear the input field after saving
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsBreak(false);
  };

  return (
    <div className="focus-timer-container">
      <h1>FOCUS TIMER WITH POMODORO</h1>
      <div className="task-controls">
        <select
          value={task}
          onChange={(e) => setTask(e.target.value)}
        >
          <option value="">Select an Existing Task</option>
          {taskList.map((t, index) => (
            <option key={index} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div>
          <input
            type="text"
            placeholder="Or enter a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button
            className="save-button"
            onClick={saveTask}
            disabled={!newTask.trim()} // Disable button if input is empty
          >
            Save
          </button>
        </div>
        <input
          type="number"
          placeholder="Work Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          min="1"
        />
        <input
          type="number"
          placeholder="Break Duration (minutes)"
          value={breakDuration}
          onChange={(e) => setBreakDuration(Number(e.target.value))}
          min="1"
        />
        <button className="start-button" onClick={startTimer} disabled={isRunning}>
          Start
        </button>
        <button className="stop-button" onClick={stopTimer} disabled={!isRunning}>
          Stop
        </button>
        <button className="reset-button" onClick={resetTimer}>Reset</button>
      </div>
      <h2>{task || newTask || "No task selected"}</h2>
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
