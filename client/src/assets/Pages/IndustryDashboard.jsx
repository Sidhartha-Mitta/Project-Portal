import React, { useEffect, useState } from 'react';
import { motion,AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { FaCheckCircle } from 'react-icons/fa';
import { FaProjectDiagram, FaClock, FaStar, FaEye, FaTrash, FaComment, FaEdit, FaGithub, FaDownload, FaExternalLinkAlt, FaChartLine, FaUsers, FaFilter, FaPlus, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ProjectSubmissionsModal from '../Common/ProjectSubmissionsModal';
import ProjectRatingModal from '../Common/ProjectRatingModal';

const IndustryDashboard = () => {
  motion;
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { dashboardData, getDashboardData, loading, approveProject } = useProjectStore();
  const [activeSection, setActiveSection] = useState('overview');
  const [submissionsModal, setSubmissionsModal] = useState({ isOpen: false, project: null });
  const [ratingModal, setRatingModal] = useState({ isOpen: false, project: null });
  const [editModal, setEditModal] = useState({ isOpen: false, project: null });
  const [feedbackFilter, setFeedbackFilter] = useState({ project: '', rating: '', date: '' });

  const handleApproveProject = async (projectId) => {
    try {
      await approveProject(projectId);
      toast.success('Project approved and marked as completed!');
      getDashboardData(); // Refresh dashboard data
    } catch (error) {
      toast.error(error.message || 'Failed to approve project');
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const analyticsData = dashboardData?.analytics || {};
  const ongoingProjects = dashboardData?.ongoingProjects || [];
  const completedProjects = dashboardData?.completedProjects || [];
  const postedProjects = dashboardData?.postedProjects || [];

  // Chart data for analytics
  const projectStatusData = [
    { name: 'Posted', value: postedProjects.length, color: '#3B82F6' },
    { name: 'In Progress', value: ongoingProjects.length, color: '#F59E0B' },
    { name: 'Completed', value: completedProjects.length, color: '#10B981' }
  ];

  const completionTrendData = analyticsData.completionTrend || [
    { month: 'Jan', completed: 5 },
    { month: 'Feb', completed: 8 },
    { month: 'Mar', completed: 12 },
    { month: 'Apr', completed: 15 },
    { month: 'May', completed: 18 },
    { month: 'Jun', completed: 22 }
  ];

  // Collect all feedback for management
  const allFeedback = completedProjects.flatMap(project =>
    project.ratings?.[0]?.memberRatings?.map(rating => ({
      project: project.title,
      student: rating.memberName || 'Unknown Student',
      rating: rating.rating,
      comment: rating.comment,
      date: project.ratings[0].createdAt
    })) || []
  );

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

    return projects.map((project, index) => (
      <motion.div
        key={project._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                project.status === 'modify' ? 'bg-orange-100 text-orange-800' :
                project.status === 'in-progress' || project.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {project.status === 'modify' ? 'modifications requested' : project.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3 leading-relaxed">{project.description}</p>

            {/* Project Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <FaClock className="mr-2 text-gray-400" />
                <span>Posted: {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              {project.team && (
                <div className="flex items-center text-sm text-gray-500">
                  <FaCheckCircle className="mr-2 text-gray-400" />
                  <span>Team: {project.team.members?.filter(m => m.status === 'active').length || 0} members</span>
                </div>
              )}
            </div>

            {/* Latest Submission Info */}
            {type === 'ongoing' && project.submissions && project.submissions.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center">
                    <FaEye className="mr-2 text-blue-600" />
                    Latest Submission
                  </h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {new Date(project.submissions[project.submissions.length - 1]?.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  {project.submissions[project.submissions.length - 1]?.repoLink && (
                    <a
                      href={project.submissions[project.submissions.length - 1].repoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                    >
                      <FaGithub className="mr-2" />
                      View GitHub Repo
                    </a>
                  )}
                  {project.submissions[project.submissions.length - 1]?.zipFile && (
                    <a
                      href={project.submissions[project.submissions.length - 1].zipFile.url}
                      download={project.submissions[project.submissions.length - 1].zipFile.filename}
                      className="flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <FaDownload className="mr-2" />
                      Download ZIP
                    </a>
                  )}
                  {project.submissions[project.submissions.length - 1]?.liveDemo && (
                    <a
                      href={project.submissions[project.submissions.length - 1].liveDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <FaExternalLinkAlt className="mr-2" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {type === 'posted' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/projects/${project._id}/applicants`)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center shadow-md"
              >
                <FaEye className="mr-2" />
                View Applicants
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditModal({ isOpen: true, project })}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center shadow-md"
              >
                <FaEdit className="mr-2" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this project?')) {
                    // Add delete functionality
                  }
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center shadow-md"
              >
                <FaTrash className="mr-2" />
                Delete
              </motion.button>
            </>
          )}
          {type === 'ongoing' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSubmissionsModal({ isOpen: true, project })}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center shadow-md"
              >
                <FaEye className="mr-2" />
                View Submissions
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleApproveProject(project._id)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center shadow-md"
              >
                <FaCheckCircle className="mr-2" />
                Approve & Complete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.info('Request modification functionality to be implemented')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center shadow-md"
              >
                <FaArrowRight className="mr-2" />
                Request Modification
              </motion.button>
            </>
          )}
          {type === 'completed' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRatingModal({ isOpen: true, project })}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center shadow-md"
            >
              <FaStar className="mr-2" />
              Rate Students
            </motion.button>
          )}
        </div>
      </motion.div>
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
                { id: 'overview', label: 'Overview', icon: FaChartLine },
                { id: 'posted', label: 'Posted Projects', icon: FaProjectDiagram, count: postedProjects.length },
                { id: 'ongoing', label: 'In-Progress Projects', icon: FaClock, count: ongoingProjects.length },
                { id: 'completed', label: 'Completed Projects', icon: FaCheckCircle, count: completedProjects.length },
                { id: 'feedback', label: 'Feedback Management', icon: FaComment, count: allFeedback.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeSection === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-8 mb-8 text-white"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-indigo-100 text-lg">
            Manage your posted projects and review team submissions
          </p>
          <div className="mt-4 flex items-center space-x-6">
            <div className="flex items-center">
              <FaProjectDiagram className="mr-2 text-yellow-300" />
              <span className="text-sm">Project Management Hub</span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="mr-2 text-green-300" />
              <span className="text-sm">Quality Assurance</span>
            </div>
          </div>
        </motion.div>

        {/* Overview / Analytics Section */}
        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
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
                  { title: 'Total Posted Projects', value: postedProjects.length, icon: FaProjectDiagram, gradient: 'from-blue-500 to-blue-600' },
                  { title: 'In Progress Projects', value: ongoingProjects.length, icon: FaClock, gradient: 'from-yellow-500 to-orange-500' },
                  { title: 'Completed Projects', value: completedProjects.length, icon: FaCheckCircle, gradient: 'from-green-500 to-emerald-500' },
                  { title: 'Pending Submissions', value: ongoingProjects.filter(p => !p.submissions || p.submissions.length === 0).length, icon: FaEye, gradient: 'from-purple-500 to-pink-500' }
                ].map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg p-6 text-white relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <card.icon className="text-3xl mb-2 opacity-80" />
                      <p className="text-white/80 text-sm font-medium">{card.title}</p>
                      <p className="text-3xl font-bold">{card.value || 0}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaChartLine className="mr-2 text-blue-500" />
                    Project Status Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {projectStatusData.map((entry, index) => (
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
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaCheckCircle className="mr-2 text-green-500" />
                    Completion Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={completionTrendData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Posted Projects Section */}
          {activeSection === 'posted' && (
            <motion.div
              key="posted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Posted Projects</h2>
              <div className="space-y-6">
                {renderProjects(postedProjects, 'posted')}
              </div>
            </motion.div>
          )}

          {/* In-Progress Projects Section */}
          {activeSection === 'ongoing' && (
            <motion.div
              key="ongoing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">In-Progress Projects</h2>
              <div className="space-y-6">
                {renderProjects(ongoingProjects, 'ongoing')}
              </div>
            </motion.div>
          )}

          {/* Completed Projects Section */}
          {activeSection === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Completed Projects</h2>
              <div className="space-y-6">
                {renderProjects(completedProjects, 'completed')}
              </div>
            </motion.div>
          )}

          {/* Feedback Management Section */}
          {activeSection === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Feedback Management</h2>

              {/* Feedback Filters */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex items-center">
                  <FaFilter className="mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <select
                  value={feedbackFilter.project}
                  onChange={(e) => setFeedbackFilter({...feedbackFilter, project: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Projects</option>
                  {completedProjects.map(project => (
                    <option key={project._id} value={project.title}>{project.title}</option>
                  ))}
                </select>
                <select
                  value={feedbackFilter.rating}
                  onChange={(e) => setFeedbackFilter({...feedbackFilter, rating: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              {/* Feedback List */}
              <div className="space-y-4">
                {allFeedback
                  .filter(feedback =>
                    (!feedbackFilter.project || feedback.project === feedbackFilter.project) &&
                    (!feedbackFilter.rating || feedback.rating.toString() === feedbackFilter.rating)
                  )
                  .map((feedback, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{feedback.project}</h4>
                          <p className="text-sm text-gray-600">Student: {feedback.student}</p>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-sm ${i < feedback.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium">{feedback.rating}/5</span>
                        </div>
                      </div>
                      {feedback.comment && (
                        <p className="text-gray-700 text-sm italic">"{feedback.comment}"</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(feedback.date).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                {allFeedback.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No feedback available yet
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <ProjectSubmissionsModal
          isOpen={submissionsModal.isOpen}
          onClose={() => setSubmissionsModal({ isOpen: false, project: null })}
          project={submissionsModal.project}
        />

        <ProjectRatingModal
          isOpen={ratingModal.isOpen}
          onClose={() => setRatingModal({ isOpen: false, project: null })}
          project={ratingModal.project}
        />

        {/* Edit Project Modal - Placeholder for now */}
        {editModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Project</h2>
              <p className="text-gray-600 mb-4">Edit project functionality to be implemented</p>
              <button
                onClick={() => setEditModal({ isOpen: false, project: null })}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndustryDashboard;