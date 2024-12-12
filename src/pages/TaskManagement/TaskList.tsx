// TaskListScreen.tsx
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
    dueDate: null,
    priority: "high",
    status: "completed",
  },
];

const TaskList: React.FC = () => {
  const [newTaskToggle, setNewTaskToggle] = useState(false);
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<Task[]>(mockData);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const handleNewTaskToggle = () => {
    setNewTaskToggle(!newTaskToggle);
  };

  const handleAddTask = (newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const [searchVal, setSearchVal] = useState("");
  // function handleSearchClick() {
  //   if (searchVal === "") {
  //     setTasks(categories);
  //     return;
  //   }
  //   const filterBySearch = categories.filter((item) => {
  //     if (item.tasks.values.toLowerCase().includes(searchVal.toLowerCase())) {
  //       return item;
  //     }
  //   });
  //   setProducts(filterBySearch);
  // }
  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          className="input input-bordered w-full p-2 rounded-lg border-2 mr-4"
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="w-full p-4 space-y-4">
          <button
            onClick={handleNewTaskToggle}
            className="btn btn-primary bg-[#AEEEEE] px-4 py-2 shadow-lg rounded-md"
          >
            {!newTaskToggle ? (
              <span className="text-black font-medium">New Task</span>
            ) : (
              <span className="text-black font-medium">Cancel</span>
            )}
          </button>
          {newTaskToggle ? <NewTask onAddTask={handleAddTask} /> : null}
        </div>
      </div>
      <div className="p-5 bg-gray-100 shadow-md">
        <div className="bg-gray-100 rounded-md ">
          {tasks
            .filter((item) => {
              return search.toLowerCase() === ""
                ? item
                : item.title.toLowerCase().includes(search.toLowerCase());
            })
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
              />
            ))}
        </div>
      </div>
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
