// TaskCard.tsx
import React, { forwardRef } from "react";
import { Task } from "../../types/type";
interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, onClick, ...props }, ref) => {
    const priorityStyles: Record<Task["priority"], string> = {
      low: "bg-green-100 text-green-500",
      medium: "bg-yellow-100 text-yellow-500",
      high: "bg-red-100 text-red-500",
    };

    // Define status-specific styles
    const statusStyles: Record<Task["status"], string> = {
      inprogress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      todo: "bg-blue-100 text-blue-800",
      expired: "bg-red-100 text-red-800",
    };

    const taskStyles: Record<Task["status"], string> = {
      completed: "bg-green-50",
      inprogress: "bg-yellow-50",
      todo: "text-blue-700",
      expired: "text-red-700",
      //overdue: "bg-red-50",
    };

    return (
      <div
        ref={ref}
        {...props}
        className={`p-6 border rounded-lg shadow-lg hover:shadow-xl transition-all ${
          statusStyles[task.status] || "bg-gray-100 text-gray-600"
        }`}
        onClick={onClick}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xl text-gray-800">{task.title}</h3>
          <span className={`font-semibold ${statusStyles[task.status]}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-600 mt-2">{task.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span
            className={`px-3 py-1 text-base font-semibold rounded-md ${priorityStyles[task.priority]}`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </span>
          <span className="text-base text-gray-500">
            {task.dueDate ? `Due: ${task.dueDate}` : "No Due Date"}
          </span>
        </div>
      </div>
    );
  }
);

export default TaskCard;