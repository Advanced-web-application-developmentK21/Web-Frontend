import React, { useState } from "react";
import { Task } from "../../types/type";
import TaskCard from "./TaskCard";
import NewTask from "./NewTask";
import TaskDetails from "./TaskDetails";

const mockData: Task[] = [
  {
    id: "1",
    title: "Submit Project Report",
    description: "Prepare and submit the final project report.",
    startDate: null,
    dueDate: null,
    priority: "high",
    status: "completed",
    estimateTime: 2.5,
  },
  {
    id: "2",
    title: "Project Report",
    description: "Prepare and submit the final project report.",
    startDate: null,
    dueDate: null,
    priority: "high",
    status: "todo",
    estimateTime: 3.5,
  },
  // Add more mock tasks if needed
];

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockData);
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false); // For the New Task modal
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("title");

  // Filters tasks by priority and status
  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    return matchesPriority && matchesStatus && matchesSearch;
  });

  // Sort tasks based on the selected criteria
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      return a.priority.localeCompare(b.priority); // Sort by priority
    } else if (sortBy === "dueDate" && a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); // Sort by due date
    }
    return a.title.localeCompare(b.title); // Default: sort by title
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((prevTask) =>
        prevTask.id === updatedTask.id ? updatedTask : prevTask
      )
    );
    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleNewTaskModalToggle = () => {
    setIsNewTaskModalOpen(!isNewTaskModalOpen);
  };

  const handleAddTask = (newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setIsNewTaskModalOpen(false); // Close the modal after adding the task
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Title Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 leading-tight">
            Task Management
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your tasks efficiently and stay on top of your projects
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full md:w-3/4 p-4 border border-gray-300 rounded-full shadow-md focus:ring-4 focus:ring-blue-300 focus:outline-none transition"
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Filters */}
          <div className="flex gap-4">
            <select
              className="p-3 border border-gray-300 rounded-md"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="p-3 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="p-3 border border-gray-300 rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="title">Sort by Title</option>
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
            </select>
          </div>
        </div>

        {/* Button placed below the search and filters */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={handleNewTaskModalToggle}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition"
          >
            {isNewTaskModalOpen ? "Cancel" : "New Task"}
          </button>
        </div>
        {/* Task Cards */}
        <div className="flex flex-col gap-4">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>
      </div>

      {isNewTaskModalOpen && (
        <NewTask onAddTask={handleAddTask} onClose={handleNewTaskModalToggle} />
      )}

      {isModalOpen && selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default TaskList;
