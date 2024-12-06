import React, { useState, useEffect } from "react";

function FocusTimer() {
  const [task, setTask] = useState<string>("");
  const [duration, setDuration] = useState<number>(25); // default duration in minutes
  const [timeLeft, setTimeLeft] = useState<number>(0); // countdown in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>; // Explicitly type the timer

    if (isRunning && timeLeft > 0) {
        timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
    } else if (timeLeft === 0 && isRunning) {
        setIsRunning(false);
        alert("Session completed!");
    }

    return () => clearInterval(timer); // Clean up the interval
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (task.trim() === "") {
      alert("Please enter a task name!");
      return;
    }
    setTimeLeft(duration * 60); // convert minutes to seconds
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>FOCUS TIMER</h1>
      <p>Welcome to the React FocusTimer.</p>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter task name"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          min="1"
          style={{ marginRight: "10px" }}
        />
        <button onClick={startTimer} disabled={isRunning}>
          Start
        </button>
        <button onClick={stopTimer} disabled={!isRunning}>
          Stop
        </button>
        <button onClick={resetTimer}>Reset</button>
      </div>
      <h2>{task || "No task selected"}</h2>
      <h3>
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </h3>
      {isRunning && (
        <div
          style={{
            width: "300px",
            height: "10px",
            background: "#ddd",
            margin: "20px auto",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${((duration * 60 - timeLeft) / (duration * 60)) * 100}%`,
              height: "10px",
              background: "green",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default FocusTimer;
