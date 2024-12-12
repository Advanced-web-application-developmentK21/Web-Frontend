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
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-red-100 text-red-700",
    };
    const statusStyles: Record<Task["status"], string> = {
      overdue: "text-red-700",
      inprogress: "text-yellow-700",
      completed: "text-green-700",
    };
    const taskStyles: Record<Task["status"], string> = {
      completed: "bg-green-50",
      inprogress: "bg-yellow-50",
      overdue: "bg-red-50",
    };

    return (
      <div
        ref={ref}
        {...props}
        className={`mb-3 p-3  border rounded-md shadow-sm hover:shadow-lg cursor-pointer ${
          taskStyles[task.status]
        }`}
        onClick={onClick}
      >
        <div className="flex justify-between">
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <h3 className={`font-semibold ${statusStyles[task.status]}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </h3>
        </div>
        <p className="text-sm text-gray-500">{task.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span
            className={`px-2 py-1 text-xs rounded ${
              priorityStyles[task.priority]
            }`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{" "}
            Priority
          </span>
          <span className="text-xs text-gray-700 font-medium ">
            Due: {task.dueDate?.toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  }
);

export default TaskCard;
