import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useProjectStore } from "../../store/projectStore";
import {
  FaProjectDiagram,
  FaCheckCircle,
  FaClock,
  FaStar,
  FaUpload,
  FaEye,
  FaComment,
  FaChartLine,
  FaTrophy,
  FaFire,
  FaTimes,
  FaGithub,
  FaDownload,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaUser,
  FaExclamationTriangle,
} from "react-icons/fa";
import ProjectSubmissionModal from "../Common/ProjectSubmissionModal";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { dashboardData, getDashboardData, loading } = useProjectStore();
  const [activeSection, setActiveSection] = useState("overview");
  const [submissionModal, setSubmissionModal] = useState({
    isOpen: false,
    project: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    project: null,
  });
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    project: null,
  });

  useEffect(() => {
    getDashboardData();
  }, []);

  const analyticsData = dashboardData?.analytics || {};
  const appliedProjects = dashboardData?.appliedProjects || [];
  const acceptedProjects = dashboardData?.acceptedProjects || [];
  const rejectedProjects = dashboardData?.rejectedProjects || [];
  const completedProjects = dashboardData?.completedProjects || [];
  const ongoingProjects = dashboardData?.ongoingProjects || [];
  const filteredAcceptedProjects = acceptedProjects.filter(
    (p) => (p.status || "").trim().toLowerCase() !== "completed"
  );
  const completedFromAccepted = acceptedProjects.filter(
    (p) => (p.status || "").trim().toLowerCase() === "completed"
  );
  const completedFromOngoing = ongoingProjects.filter(
    (p) => (p.status || "").trim().toLowerCase() === "completed"
  );
  const computedCompletedProjects = Array.from(
    new Map(
      [...completedProjects, ...completedFromAccepted, ...completedFromOngoing].map((p) => [p._id, p])
    ).values()
  );
  const modificationRequests = ongoingProjects.filter((project) =>
    project.submissions?.some(
      (sub) => sub.status === "changes-requested" || sub.status === "modify"
    )
  );

  // Derived counts for consistent Overview metrics
  const derivedCounts = {
    applied: appliedProjects.length,
    accepted: filteredAcceptedProjects.length,
    rejected: rejectedProjects.length,
    completed: computedCompletedProjects.length,
  };

  // Chart data
  const statusChartData = [
    { name: "Applied", value: derivedCounts.applied, color: "#3B82F6" },
    { name: "Accepted", value: derivedCounts.accepted, color: "#10B981" },
    { name: "Rejected", value: derivedCounts.rejected, color: "#EF4444" },
    { name: "Completed", value: derivedCounts.completed, color: "#8B5CF6" },
  ];

  const ratingsTrendData = analyticsData.ratingsTrend || [
    { month: "Jan", rating: 4.2 },
    { month: "Feb", rating: 4.5 },
    { month: "Mar", rating: 4.1 },
    { month: "Apr", rating: 4.8 },
    { month: "May", rating: 4.6 },
    { month: "Jun", rating: 4.9 },
  ];

  const projectStatusData = [
    { name: "Applied", value: derivedCounts.applied },
    { name: "Accepted", value: derivedCounts.accepted },
    { name: "Completed", value: derivedCounts.completed },
  ];

  const renderProjects = (projects, type) => {
    if (projects.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500"
        >
          No {type} projects found
        </motion.div>
      );
    }

    return projects.map((project) => (
      <div
        key={project._id}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {project.title}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{project.description}</p>
            <div className="flex items-center mt-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : project.status === "modify"
                    ? "bg-orange-100 text-orange-800"
                    : project.status === "in-progress" ||
                      project.status === "assigned"
                    ? "bg-yellow-100 text-yellow-800"
                    : project.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {type === "modifications"
                  ? "Modifications Requested"
                  : project.status}
              </span>
              {type === "modifications" && (
                <span className="ml-2 flex items-center text-orange-600">
                  <FaExclamationTriangle className="mr-1" />
                  Needs Revision
                </span>
              )}
              {type === "completed" &&
                project.ratings?.[0]?.memberRatings?.find(
                  (r) => r.member === user._id
                ) && (
                  <span className="ml-2 flex items-center text-yellow-500">
                    <FaStar className="mr-1" />
                    {
                      project.ratings[0].memberRatings.find(
                        (r) => r.member === user._id
                      ).rating
                    }
                    /5
                  </span>
                )}
            </div>
            {type === "accepted" && project.deadline && (
              <div className="mt-2 text-sm text-gray-600">
                <FaCalendarAlt className="inline mr-1" />
                <strong>Deadline:</strong>{" "}
                {new Date(project.deadline).toLocaleDateString()}
              </div>
            )}
            {type === "completed" && project.submissions?.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Submission Links:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.submissions[project.submissions.length - 1]
                    ?.repoLink && (
                    <a
                      href={
                        project.submissions[project.submissions.length - 1]
                          .repoLink
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-lg hover:bg-gray-900 transition-colors text-xs"
                    >
                      <FaGithub className="mr-1" />
                      GitHub
                    </a>
                  )}
                  {project.submissions[project.submissions.length - 1]
                    ?.zipFile && (
                    <a
                      href={
                        project.submissions[project.submissions.length - 1]
                          .zipFile.url
                      }
                      download={
                        project.submissions[project.submissions.length - 1]
                          .zipFile.filename
                      }
                      className="flex items-center bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-xs"
                    >
                      <FaDownload className="mr-1" />
                      ZIP
                    </a>
                  )}
                  {project.submissions[project.submissions.length - 1]
                    ?.liveDemo && (
                    <a
                      href={
                        project.submissions[project.submissions.length - 1]
                          .liveDemo
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors text-xs"
                    >
                      <FaExternalLinkAlt className="mr-1" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            )}
            {type === "modifications" && project.submissions?.length > 0 && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="text-sm font-semibold text-orange-800 mb-2">
                  Latest Feedback:
                </h4>
                <p className="text-sm text-orange-700">
                  {project.submissions[project.submissions.length - 1]
                    ?.feedback ||
                    "Please review and resubmit your project with the requested changes."}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Feedback received:{" "}
                  {new Date(
                    project.submissions[
                      project.submissions.length - 1
                    ]?.feedbackAt
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-2 ml-4">
            {(type === "applied" || type === "accepted") && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
              >
                <FaEye className="mr-2" />
                View Details
              </motion.button>
            )}
            {type === "accepted" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSubmissionModal({ isOpen: true, project })}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center text-sm"
              >
                <FaUpload className="mr-2" />
                Submit Project
              </motion.button>
            )}
            {type === "modifications" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSubmissionModal({ isOpen: true, project })}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center text-sm"
              >
                <FaUpload className="mr-2" />
                Resubmit Project
              </motion.button>
            )}
            {type === "completed" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFeedbackModal({ isOpen: true, project })}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center text-sm"
              >
                <FaComment className="mr-2" />
                View Feedback
              </motion.button>
            )}
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <FaUser className="mr-1" />
          <span>Industry: {project.postedBy?.name}</span>
          <span className="mx-2">•</span>
          <span>
            Applied: {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: FaChartLine },
                {
                  id: "applied",
                  label: "Applied Projects",
                  icon: FaClock,
                  count: appliedProjects.length,
                },
                {
                  id: "accepted",
                  label: "Accepted Projects",
                  icon: FaCheckCircle,
                  count: filteredAcceptedProjects.length,
                },
                {
                  id: "modifications",
                  label: "Modifications Requested",
                  icon: FaExclamationTriangle,
                  count: modificationRequests.length,
                },
                {
                  id: "completed",
                  label: "Completed Projects",
                  icon: FaTrophy,
                  count: computedCompletedProjects.length,
                },
                { id: "analytics", label: "Analytics", icon: FaChartLine },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeSection === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="mr-2" />
                  {tab.label}
                  {tab.count !== undefined && ` (${tab.count})`}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Track your project applications and submissions
          </p>
          {dashboardData?.overallRating && (
            <div className="mt-4 flex items-center">
              <span className="text-lg font-semibold text-gray-700 mr-2">
                Overall Rating:
              </span>
              <div className="flex items-center">
                <FaStar className="text-yellow-500 mr-1" />
                <span className="text-xl font-bold text-yellow-600">
                  {dashboardData.overallRating}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Overview / Analytics Section */}
        <AnimatePresence mode="wait">
          {activeSection === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    title: "Applied Projects",
                    value: derivedCounts.applied,
                    icon: FaClock,
                    gradient: "from-blue-500 to-blue-600",
                    description: "Applications submitted",
                  },
                  {
                    title: "Accepted Projects",
                    value: derivedCounts.accepted,
                    icon: FaCheckCircle,
                    gradient: "from-green-500 to-emerald-500",
                    description: "Applications accepted",
                  },
                  {
                    title: "Rejected Projects",
                    value: rejectedProjects.length,
                    icon: FaTimes,
                    gradient: "from-red-500 to-red-600",
                    description: "Applications rejected",
                  },
                  {
                    title: "Completed Projects",
                    value: derivedCounts.completed,
                    icon: FaTrophy,
                    gradient: "from-purple-500 to-pink-500",
                    description: "Projects finished",
                  },
                ].map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg p-6 text-white relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <card.icon className="text-3xl mb-2 opacity-80" />
                      <p className="text-white/80 text-sm font-medium">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold mb-1">
                        {card.value || 0}
                      </p>
                      <p className="text-white/60 text-xs">
                        {card.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaChartLine className="mr-2 text-blue-500" />
                    Project Status Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaStar className="mr-2 text-yellow-500" />
                    Average Rating Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={ratingsTrendData}>
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 5]} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#F59E0B"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Applied Projects Section */}
          {activeSection === "applied" && (
            <motion.div
              key="applied"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Applied Projects
              </h2>
              <div className="space-y-6">
                {renderProjects(appliedProjects, "applied")}
              </div>
            </motion.div>
          )}

          {/* Accepted Projects Section */}
          {activeSection === "accepted" && (
            <motion.div
              key="accepted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Accepted Projects
              </h2>
              <div className="space-y-6">
                {renderProjects(filteredAcceptedProjects, "accepted")}
              </div>
            </motion.div>
          )}

          {/* Modifications Requested Section */}
          {activeSection === "modifications" && (
            <motion.div
              key="modifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Modifications Requested
              </h2>
              <div className="space-y-6">
                {renderProjects(modificationRequests, "modifications")}
              </div>
            </motion.div>
          )}

          {/* Completed Projects Section */}
          {activeSection === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Completed Projects
              </h2>
              <div className="space-y-6">
                {renderProjects(computedCompletedProjects, "completed")}
              </div>
            </motion.div>
          )}

          {/* Analytics Section */}
          {activeSection === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Analytics
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaChartLine className="mr-2 text-blue-500" />
                    Total Projects vs Status
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectStatusData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaStar className="mr-2 text-yellow-500" />
                    Ratings Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={ratingsTrendData}>
                      <defs>
                        <linearGradient
                          id="colorRating"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#F59E0B"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#F59E0B"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 5]} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="rating"
                        stroke="#F59E0B"
                        fillOpacity={1}
                        fill="url(#colorRating)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <ProjectSubmissionModal
          isOpen={submissionModal.isOpen}
          onClose={() => setSubmissionModal({ isOpen: false, project: null })}
          project={submissionModal.project}
        />

        {/* Project Details Modal */}
        {detailsModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {detailsModal.project?.title}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600">
                      {detailsModal.project?.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">Industry</h4>
                      <p className="text-gray-600">
                        {detailsModal.project?.postedBy?.name}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Applied Date
                      </h4>
                      <p className="text-gray-600">
                        {new Date(
                          detailsModal.project?.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Current Status
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        detailsModal.project?.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : detailsModal.project?.status === "modify"
                          ? "bg-orange-100 text-orange-800"
                          : detailsModal.project?.status === "in-progress" ||
                            detailsModal.project?.status === "assigned"
                          ? "bg-yellow-100 text-yellow-800"
                          : detailsModal.project?.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {detailsModal.project?.status}
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() =>
                      setDetailsModal({ isOpen: false, project: null })
                    }
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Feedback Modal */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Project Feedback
                </h2>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feedbackModal.project?.title}
                </h3>

                {feedbackModal.project?.ratings?.[0] ? (
                  <div className="space-y-4">
                    {/* Overall Project Rating */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FaStar className="text-blue-500 mr-2" />
                        <span className="font-semibold">
                          Overall Project Rating:
                        </span>
                        <span className="ml-2 text-xl font-bold text-blue-600">
                          {feedbackModal.project.ratings[0].rating}/5
                        </span>
                      </div>
                      {feedbackModal.project.ratings[0].comment && (
                        <p className="text-gray-700">
                          <strong>Project Feedback:</strong>{" "}
                          {feedbackModal.project.ratings[0].comment}
                        </p>
                      )}
                    </div>

                    {/* Individual Student Rating */}
                    {feedbackModal.project.ratings[0].memberRatings?.find(
                      (r) => r.member === user._id
                    ) && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <FaStar className="text-yellow-500 mr-2" />
                          <span className="font-semibold">
                            Your Individual Rating:
                          </span>
                          <span className="ml-2 text-xl font-bold text-yellow-600">
                            {
                              feedbackModal.project.ratings[0].memberRatings.find(
                                (r) => r.member === user._id
                              ).rating
                            }
                            /5
                          </span>
                        </div>
                        {feedbackModal.project.ratings[0].memberRatings.find(
                          (r) => r.member === user._id
                        ).feedback && (
                          <p className="text-gray-700">
                            <strong>Your Feedback:</strong>{" "}
                            {
                              feedbackModal.project.ratings[0].memberRatings.find(
                                (r) => r.member === user._id
                              ).feedback
                            }
                          </p>
                        )}
                      </div>
                    )}

                    {/* Team Member Ratings */}
                    {feedbackModal.project.ratings[0].memberRatings &&
                      feedbackModal.project.ratings[0].memberRatings.length >
                        0 && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-3">
                            Team Member Ratings:
                          </h4>
                          <div className="space-y-2">
                            {feedbackModal.project.ratings[0].memberRatings.map(
                              (memberRating, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-white p-2 rounded"
                                >
                                  <span className="text-sm font-medium text-gray-700">
                                    {memberRating.member?.name ||
                                      `Team Member ${index + 1}`}
                                  </span>
                                  <div className="flex items-center">
                                    <FaStar className="text-yellow-500 mr-1" />
                                    <span className="font-bold text-yellow-600">
                                      {memberRating.rating}/5
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="text-gray-500">No feedback available yet.</p>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() =>
                      setFeedbackModal({ isOpen: false, project: null })
                    }
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
