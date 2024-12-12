import React, { useState } from "react";
import { Task } from "../../types/type";
import DatePicker from "react-datepicker";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  onClose,
  onSave,
  onDelete,
}) => {
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditedTask({ ...editedTask, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear errors on input
  };
  const handleDateChange = (date: Date | null) => {
    setEditedTask({ ...editedTask, dueDate: date });
  };
  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!editedTask.title.trim()) {
      newErrors.title = "Task name is required.";
    }
    if (!editedTask.priority) {
      newErrors.priority = "Priority must be selected.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateFields()) {
      onSave(editedTask);
      onClose();
    }
  };

  const handleDelete = () => {
    if (isDeleteConfirm) {
      onDelete(task.id);
      onClose();
    } else {
      setIsDeleteConfirm(true);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="w-full max-w-lg p-6 bg-[#e6f4f1] rounded-lg shadow-lg transform transition-all"
        style={{ animation: "fadeIn 0.3s ease-in-out" }}
      >
        <h2 className="text-2xl text-center px-4 mb-6 py-2 rounded-lg font-bold text-white bg-[#008b8b]">
          Task Details
        </h2>
        <div className="space-y-5">
          {/* Task Name */}
          <div>
            <label className="mb-1 block text-md font-medium text-gray-700 ">
              Task Name
            </label>
            <input
              type="text"
              name="title"
              value={editedTask.title}
              onChange={handleInputChange}
              className={`input input-bordered w-full size-10 input-bordered border-2 rounded-md border-slate-200 p-2 ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-md mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-md font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={editedTask.description}
              onChange={handleInputChange}
              className="textarea textarea-bordered w-full border-2 rounded-md border-slate-200 p-2"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1 block text-md font-medium text-gray-700">
              Priority
            </label>
            <select
              name="priority"
              value={editedTask.priority}
              onChange={handleInputChange}
              className="select select-bordered w-full input input-bordered border-2 rounded-md border-slate-200 "
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && (
              <p className="text-red-500 text-md mt-1">{errors.priority}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-md font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={editedTask.status}
              onChange={handleInputChange}
              className="select select-bordered w-full input input-bordered border-2 rounded-md border-slate-200 "
            >
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="mb-1 block text-md font-medium text-gray-700">
              Due Date
            </label>
            <DatePicker
              showIcon
              selected={editedTask.dueDate}
              onChange={handleDateChange}
              className="flex border-2 rounded-md cursor-pointer"
              icon={
                <svg
                  className="mt-0.5"
                  height="24"
                  version="1.1"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="translate(0 -1028.4)">
                    <path
                      d="m5 1032.4c-1.1046 0-2 0.9-2 2v14c0 1.1 0.8954 2 2 2h6 2 6c1.105 0 2-0.9 2-2v-14c0-1.1-0.895-2-2-2h-6-2-6z"
                      fill="#bdc3c7"
                    />
                    <path
                      d="m5 3c-1.1046 0-2 0.8954-2 2v14c0 1.105 0.8954 2 2 2h6 2 6c1.105 0 2-0.895 2-2v-14c0-1.1046-0.895-2-2-2h-6-2-6z"
                      fill="#ecf0f1"
                      transform="translate(0 1028.4)"
                    />
                    <path
                      d="m5 3c-1.1046 0-2 0.8954-2 2v3 1h18v-1-3c0-1.1046-0.895-2-2-2h-6-2-6z"
                      fill="#e74c3c"
                      transform="translate(0 1028.4)"
                    />
                    <path
                      d="m7 5.5a1.5 1.5 0 1 1 -3 0 1.5 1.5 0 1 1 3 0z"
                      fill="#c0392b"
                      transform="translate(.5 1028.4)"
                    />
                    <path
                      d="m6 1c-0.5523 0-1 0.4477-1 1v3c0 0.5523 0.4477 1 1 1s1-0.4477 1-1v-3c0-0.5523-0.4477-1-1-1z"
                      fill="#bdc3c7"
                      transform="translate(0 1028.4)"
                    />
                    <path
                      d="m7 5.5a1.5 1.5 0 1 1 -3 0 1.5 1.5 0 1 1 3 0z"
                      fill="#c0392b"
                      transform="translate(12.5 1028.4)"
                    />
                    <g fill="#bdc3c7">
                      <path d="m18 1029.4c-0.552 0-1 0.4-1 1v3c0 0.5 0.448 1 1 1s1-0.5 1-1v-3c0-0.6-0.448-1-1-1z" />
                      <path d="m5 1039.4v2h2v-2h-2zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2z" />
                      <path d="m5 1042.4v2h2v-2h-2zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2z" />
                      <path d="m5 1045.4v2h2v-2h-2zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2z" />
                    </g>
                  </g>
                </svg>
              }
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="btn btn-outline px-2 py-1 rounded-md text-white font-medium"
            style={{ backgroundColor: "#95b0b0" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary px-2 py-1 rounded-md text-white font-medium"
            style={{ backgroundColor: "#00aab0" }}
          >
            Save Changes
          </button>
          {isDeleteConfirm ? (
            <button
              onClick={handleDelete}
              className="btn btn-error px-2 py-1 rounded-md text-white font-medium"
              style={{ backgroundColor: "#ff6b6b" }}
            >
              Confirm Delete
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="btn btn-error px-2 py-1 rounded-md text-white font-medium"
              style={{ backgroundColor: "#ff6b6b" }}
            >
              Delete Task
            </button>
          )}
          {isDeleteConfirm && (
            <button
              onClick={handleCancelDelete}
              className="btn btn-outline px-2 py-1 rounded-md text-white font-medium"
              style={{ backgroundColor: "#95b0b0" }}
            >
              Cancel Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
