import { useState, useEffect } from "react";
import axios from "axios";
import { FaChartPie, FaTasks, FaClock, FaSyncAlt, FaExchangeAlt } from "react-icons/fa";
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
import moment from "moment";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

const AnalyticsPage = () => {
    const userId = localStorage.getItem("userId");
    const [loading, setLoading] = useState(false);

    const [dashboardData, setDashboardData] = useState({
        totalTimeSpent: 0,
        totalEstimatedTime: 0,
        estimatedTimePercentage: 0,
        taskCount: 0,
    });

    const [aiFeedbackData, setAiFeedbackData] = useState([
        "You're excelling in focusing on high-priority tasks. Great job!",
        "Consider balancing time across tasks to avoid backlogs.",
        "Try to spend more time on pending tasks for better progress."
    ]);
    const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1); // Default to current month
    const [selectedYear, setSelectedYear] = useState(moment().year()); // Default to current year
    const [selectedWeek, setSelectedWeek] = useState<number>(1); // Default to week 1

    const [weekStartDates, setWeekStartDates] = useState<string[]>([]);

    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const [dailyData, setDailyData] = useState({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Time Spent (hours)',
                data: [0, 0, 0, 0, 0, 0, 0], // Default empty data
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderRadius: 5,
            },
        ],
    });

    const [taskStatusData, setTaskStatusData] = useState({
        labels: ['Todo', 'In Progress', 'Completed', 'Expired'],
        datasets: [
            {
                data: [0, 0, 0, 0],
                backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'],
                hoverOffset: 10,
            },
        ],
    });

    const getStartOfWeek = (week: any, year: any) => {
        return moment().year(year).week(week).startOf('week').format('YYYY-MM-DD');
    };

    const fetchData = async (startDate: any) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:4000/task/daily-time-spent/${userId}?startDate=${startDate}`
            );
            // Assuming the API response has an array of time spent data for each day of the week
            const timeSpent = response.data;

            // Update the daily data with the fetched time spent data
            setDailyData({
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Time Spent (hours)',
                        data: timeSpent.datasets[0].data,
                        backgroundColor: 'rgba(79, 70, 229, 0.8)',
                        borderRadius: 5,
                    },
                ],
            });
        } catch (error) {
            console.error("Error fetching daily time spent data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTaskStatusData = async () => {
        try {
            // Make GET request to the backend API
            const response = await axios.get(`http://localhost:4000/task/task-status/${userId}`);

            setTaskStatusData({
                labels: ['Todo', 'In Progress', 'Completed', 'Expired'],
                datasets: [
                    {
                        data: response.data.datasets[0].data,
                        backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'],
                        hoverOffset: 10,
                    },
                ],
            });

            console.log('Updated Task Status Data:', taskStatusData); // Debugging line

            // You can now use taskStatusData to render your chart (e.g., with Chart.js)
        } catch (error) {
            console.error('Error fetching task status data:', error);
        }
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

    const handleDateChange = () => {
        const selectedStartDate = weekStartDates[selectedWeek - 1]; // Get the start date of the selected week
        fetchData(selectedStartDate); // Fetch data using the selected start date
        setShowModal(false); // Close modal after selection
    };

    const getWeeksStartDates = (year: number, month: number) => {
        const startOfMonth = moment(`${year}-${month}-01`);
        const endOfMonth = startOfMonth.clone().endOf('month');

        let weekStartDates = [];
        let currentWeekStart = startOfMonth.clone().startOf('week');  // Start of the first week

        // Loop through the weeks of the selected month
        while (currentWeekStart.isBefore(endOfMonth)) {
            weekStartDates.push(currentWeekStart.format('YYYY-MM-DD'));  // Store the start date of each week
            currentWeekStart.add(1, 'week');  // Move to the next week
        }

        return weekStartDates;
    };

    useEffect(() => {
        if (selectedYear && selectedMonth) {
            const weeks = getWeeksStartDates(selectedYear, selectedMonth);
            setWeekStartDates(weeks);

            // Calculate the current week of the selected month
            const currentDate = moment(); // Current date
            const startOfMonth = moment(`${selectedYear}-${selectedMonth}-01`); // First day of the selected month
            const currentWeekNumber = currentDate.isBetween(startOfMonth, startOfMonth.clone().endOf('month'), null, '[]')
                ? currentDate.week() - startOfMonth.week() + 1
                : 1; // If current date is in the selected month, calculate the week, otherwise default to 1

            setSelectedWeek(currentWeekNumber); // Set the selected week to the current week
        }
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        const defaultStartDate = getStartOfWeek(moment().week(), moment().year());

        // Fetch the data with the default start date
        fetchData(defaultStartDate);

        fetchTaskStatusData();
    }, [userId]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Pass the userId in the URL
                const response = await axios.get(`http://localhost:4000/task/dashboard/${userId}`);
                setDashboardData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, [userId]);

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
                        <p
                            className="text-gray-600 text-lg"
                            title="Total time spent / Total estimated time"
                        >
                            {dashboardData.totalTimeSpent}h / {dashboardData.totalEstimatedTime}h
                        </p>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-6 flex items-center hover:shadow-xl transition-shadow" title="Estimated time percentage">
                    <FaChartPie className="text-green-500 text-4xl mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Estimated Time</h2>
                        <p className="text-gray-600 text-lg">{dashboardData.estimatedTimePercentage}%</p>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-6 flex items-center hover:shadow-xl transition-shadow" title="Total number of tasks">
                    <FaTasks className="text-yellow-500 text-4xl mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Task Breakdown</h2>
                        <p className="text-gray-600 text-lg">{dashboardData.taskCount} Tasks</p>
                    </div>
                </div>

            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white shadow-lg rounded-lg p-8 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">Daily Time Spent</h3>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                        >
                            <FaExchangeAlt className="mr-2 text-white" />
                            Change Date
                        </button>
                    </div>
                    {loading ? (
                        <Loading />
                    ) : (
                        <Bar
                            data={dailyData}
                            options={{
                                responsive: true,
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            title: (tooltipItem) => {
                                                // Get the day of the week
                                                const dayOfWeek = dailyData.labels[tooltipItem[0].dataIndex]; // Use the label (Mon, Tue, etc.)
                                                // Get the start date of the selected week and calculate the corresponding date
                                                const startDate = moment(weekStartDates[selectedWeek - 1]);
                                                const date = startDate.add(tooltipItem[0].dataIndex, 'days').format('MMM D, YYYY');
                                                return `${dayOfWeek} - ${date}`; // Show day and corresponding date
                                            },
                                            label: (tooltipItem) => {
                                                // You can show the time spent for that day (example: 3 hours)
                                                return `Time Spent: ${tooltipItem.raw} hours`;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Days of the Week',
                                        },
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: 'Hours',
                                        },
                                    },
                                },
                            }}
                        />

                    )}
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
                                <p className="text-lg text-gray-600">{feedback}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modal for Date Selection */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Month, Year, and Week</h2>

                        {/* Year Selection */}
                        <div className="mb-4">
                            <label className="text-gray-800">Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    const year = Number(e.target.value);
                                    setSelectedYear(year);
                                    setWeekStartDates(getWeeksStartDates(year, selectedMonth)); // Update weeks when year changes
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                {[2023, 2024, 2025].map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Month Selection */}
                        <div className="mb-4">
                            <label className="text-gray-800">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => {
                                    const month = Number(e.target.value);
                                    setSelectedMonth(month);
                                    setWeekStartDates(getWeeksStartDates(selectedYear, month)); // Update weeks when month changes
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                disabled={!selectedYear} // Disable month selection if year is not selected
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i} value={i + 1}>
                                        {moment().month(i).format('MMMM')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Week Selection */}
                        <div className="mb-4">
                            <label className="text-gray-800">Week</label>
                            <select
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                disabled={!selectedMonth} // Disable week selection if month is not selected
                            >
                                {weekStartDates.map((startDate, index) => (
                                    <option key={startDate} value={index + 1}>
                                        Week {index + 1} - {moment(startDate).format('MMM D, YYYY')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleDateChange}
                                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                            >
                                Save
                            </button>
                        </div>

                        {/* Close Modal */}
                        <div
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-2 text-gray-500 cursor-pointer"
                        >
                            X
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AnalyticsPage;
