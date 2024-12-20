import React, { useState } from "react";
import { Task } from "../../types/type";
import DatePicker from "react-datepicker";
import axios from "axios";
import Swal from "sweetalert2";

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
  const [dateError, setDateError] = useState(true);
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditedTask({ ...editedTask, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear errors on input
  };

  const handleDateChange = (date: Date | null, field: string) => {
    // Ensure that startDate is a valid Date object
    if (editedTask.startDate && date) {
      const startDate = new Date(editedTask.startDate); // Convert it to a Date object if necessary
      if (field === "dueDate" && startDate.getTime() > date.getTime()) {
        setDateError(false);
      } else {
        setDateError(true);
        setEditedTask({
          ...editedTask,
          [field]: date,
          estimateTime: Math.ceil(
            Math.abs(startDate.getTime() - date.getTime()) / (1000 * 3600 * 24)
          ),
        });
      }
    }
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

  const handleSave = async () => {
    if (validateFields()) {
      const priorityMap = {
        low: "Low",
        medium: "Medium",
        high: "High",
      };
    
      const statusMap = {
        todo: "Todo",
        inprogress: "In Progress",
        completed: "Completed",
        expired: "Expired",
      };

      const formattedData = {
        name: editedTask.title,
        description: editedTask.description,
        priority: priorityMap[editedTask.priority],
        status: statusMap[editedTask.status],
        startDate: editedTask.startDate,
        dueDate: editedTask.dueDate
      };
    

      try {
        // API call to save the task
        const response = await axios.put(
          `http://localhost:4000/task/updateTasks/${task.id}`,
          formattedData
        );
        onSave(response.data); // Assuming the API returns the updated task
        Swal.fire({
          title: "Success!",
          text: "Task updated successfully.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          // Reload the page after closing the success alert
          window.location.reload();
        });
        onClose();
      } catch (error: any) {
        console.error("Failed to update task:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Something went wrong.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleDelete = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // API call to delete the task
          const response = await axios.delete(`http://localhost:4000/task/deleteTasks/${task.id}`);
          if (response.status === 200) {
            // Task deleted successfully
            Swal.fire({
              title: "Deleted!",
              text: "The task has been deleted.",
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              onDelete(task.id); // Update state or UI after deletion
              onClose(); // Close the modal or dialog
            });
          }
        } catch (error: any) {
          console.error("Failed to delete task:", error);
          Swal.fire({
            title: "Error!",
            text: error.response?.data?.message || "Something went wrong.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
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

          {/* Priority and Status */}
          <div className="flex space-x-4">
            {/* Priority */}
            <div className="w-full">
              <label className="mb-1 block text-md font-medium text-gray-700">
                Priority
              </label>
              <select
                name="priority"
                value={editedTask.priority}
                onChange={handleInputChange}
                className="select select-bordered w-full input input-bordered border-2 rounded-md border-slate-200"
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
            <div className="w-full">
              <label className="mb-1 block text-md font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={editedTask.status}
                onChange={handleInputChange}
                className="select select-bordered w-full input input-bordered border-2 rounded-md border-slate-200"
              >
                <option value="todo">To do</option>
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="w-full">
              <label className="mb-1 block text-md font-medium text-gray-700">
                Start Date
              </label>
              <DatePicker
                showIcon
                selected={editedTask.startDate ? new Date(editedTask.startDate) : null}
                onChange={(date) => handleDateChange(date, "startDate")}
                className="flex border-2 rounded-md cursor-pointer w-full p-2"
                showTimeSelect
                dateFormat="Pp"
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
                    </g>
                  </svg>
                }
              />
            </div>
            <div className="w-full">
              <label className="mb-1 block text-md font-medium text-gray-700">
                Due Date
              </label>
              <DatePicker
                showIcon
                selected={editedTask.dueDate ? new Date(editedTask.dueDate) : null}
                onChange={(date) => handleDateChange(date, "dueDate")}
                className="flex border-2 rounded-md cursor-pointer w-full p-2"
                showTimeSelect
                dateFormat="Pp"
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
                    </g>
                  </svg>
                }
              />
            </div>
          </div>
          {!dateError ? (
            <span className="text-red-500 mb-3">
              Due Date must be later than Start Date
            </span>
          ) : null}
          {/* Estimate Time */}
          <div className="flex mt-3">
            <label className="block text-md font-medium text-gray-700 mr-4">
              Estimated Time:
            </label>
            <div className="w-fit bg-rose-300 rounded-md pl-4 pr-4">
              {editedTask.estimateTime}
            </div>
            {/* <input
              type="number"
              name="estimatedTime"
              value={editedTask.estimateTime || ""}
              onChange={handleInputChange}
              className="input input-bordered w-full border-2 rounded-md border-slate-200 p-2"
              placeholder="Enter estimated time"
            /> */}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="btn btn-outline px-4 py-2 rounded-md text-white font-medium"
            style={{ backgroundColor: "#95b0b0" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary px-4 py-2 rounded-md text-white font-medium"
            style={{ backgroundColor: "#00aab0" }}
          >
            Save Changes
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger px-4 py-2 rounded-md text-white font-medium"
            style={{ backgroundColor: "#b74e4e" }}
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
