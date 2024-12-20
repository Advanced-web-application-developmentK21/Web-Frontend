"use client";

import { useState } from "react";
import { FaChartPie, FaTasks, FaClock, FaSyncAlt } from "react-icons/fa";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Loading from "../../components/loading";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

const AnalyticsPage = () => {
    const [loading, setLoading] = useState(false);
    const [aiFeedbackData, setAiFeedbackData] = useState([
        "You're excelling in focusing on high-priority tasks. Great job!",
        "Consider balancing time across tasks to avoid backlogs.",
        "Try to spend more time on pending tasks for better progress."
    ]);

    const dailyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Time Spent (hours)',
                data: [1, 2.5, 3, 4, 3.5, 2, 1.5],
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderRadius: 5,
            },
        ],
    };

    const taskStatusData = {
        labels: ['Completed', 'Pending', 'In Progress'],
        datasets: [
            {
                data: [12, 8, 5],
                backgroundColor: ['#10B981', '#F59E0B', '#3B82F6'],
                hoverOffset: 10,
            },
        ],
    };

    const handleRefresh = async () => {
        setLoading(true);

        // Simulate API call or data fetching
        setTimeout(() => {
            setAiFeedbackData([
                "You're performing better with task prioritization. Keep it up!",
                "Ensure consistent task completion to avoid delays.",
                "Spend additional time on pending tasks to avoid backlog."
            ]);
            setLoading(false);
        }, 2000); // Simulated delay
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-8">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-5xl font-extrabold text-gray-800">Analytics Dashboard</h1>
                <p className="text-lg text-gray-600 mt-2">Track your focus sessions and monitor your progress.</p>
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white shadow-lg rounded-lg p-6 flex items-center hover:shadow-xl transition-shadow">
                    <FaClock className="text-indigo-500 text-4xl mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Total Time Spent</h2>
                        <p className="text-gray-600 text-lg">12h / 20h</p>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-6 flex items-center hover:shadow-xl transition-shadow">
                    <FaChartPie className="text-green-500 text-4xl mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Estimated Time</h2>
                        <p className="text-gray-600 text-lg">60%</p>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-6 flex items-center hover:shadow-xl transition-shadow">
                    <FaTasks className="text-yellow-500 text-4xl mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Task Breakdown</h2>
                        <p className="text-gray-600 text-lg">25 Tasks</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white shadow-lg rounded-lg p-8 hover:shadow-xl transition-shadow">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Daily Time Spent</h3>
                    <Bar data={dailyData} />
                </div>

                <div className="bg-white shadow-lg rounded-lg p-8 hover:shadow-xl transition-shadow">
                    <h3 className="text-2xl font-bold text-gray-800 mb-12">Task Status Breakdown</h3>
                    <div className="flex justify-center">
                        <Doughnut
                            data={taskStatusData}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            font: {
                                                size: 14,
                                            },
                                        },
                                    },
                                },
                            }}
                            width={200}
                            height={200}
                        />
                    </div>
                </div>
            </div>

            {/* AI Feedback Section */}
            <div className="bg-white shadow-lg rounded-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">AI Feedback</h3>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                    >
                        <FaSyncAlt className="mr-2 text-white" /> {/* Refresh Icon */}
                        Refresh
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loading />
                    </div>
                ) : (
                    <ul className="space-y-6">
                        {aiFeedbackData.map((feedback, index) => (
                            <li key={index} className="flex items-start">
                                <FaChartPie className="text-green-500 text-3xl mr-4" />
                                <p className="text-lg">{feedback}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>


        </div>
    );
};

export default AnalyticsPage;
