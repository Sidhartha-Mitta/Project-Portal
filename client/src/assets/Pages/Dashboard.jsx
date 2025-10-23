import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { FaProjectDiagram, FaCheckCircle, FaClock, FaStar, FaUpload, FaEye, FaTrash, FaComment, FaChartLine, FaUsers, FaTrophy, FaFire, FaRocket, FaCode, FaPalette, FaDatabase, FaShieldAlt, FaGamepad, FaMobileAlt, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ProjectSubmissionModal from '../Common/ProjectSubmissionModal';
import ProjectSubmissionsModal from '../Common/ProjectSubmissionsModal';
import ProjectRatingModal from '../Common/ProjectRatingModal';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { dashboardData, getDashboardData, loading } = useProjectStore();
  const [activeTab, setActiveTab] = useState('applied');
  const [submissionModal, setSubmissionModal] = useState({ isOpen: false, project: null });
  const [submissionsModal, setSubmissionsModal] = useState({ isOpen: false, project: null });
  const [ratingModal, setRatingModal] = useState({ isOpen: false, project: null });
  const [editModal, setEditModal] = useState({ isOpen: false, project: null });

  useEffect(() => {
    getDashboardData();
  }, []);

  const analyticsData = dashboardData?.analytics || {};
  const appliedProjects = dashboardData?.appliedProjects || [];
  const acceptedProjects = dashboardData?.acceptedProjects || [];
  const rejectedProjects = dashboardData?.rejectedProjects || [];
  const ongoingProjects = dashboardData?.ongoingProjects || [];
  const completedProjects = dashboardData?.completedProjects || [];
  const postedProjects = dashboardData?.postedProjects || [];
  const modificationRequests = Array.from(
    new Map(
      [
        // Projects explicitly marked modify
        ...ongoingProjects.filter(
          (p) => (p.status || '').trim().toLowerCase() === 'modify'
        ),
        // Projects with any submission asking for modify
        ...ongoingProjects.filter((project) =>
          project.submissions?.some(
            (sub) => (sub.status || '').trim().toLowerCase() === 'modify'
          )
        ),
      ].map((p) => [p._id, p])
    ).values()
  );

  // Enhanced chart data
  const statusChartData = [
    { name: 'Applied', value: analyticsData.appliedCount || 0, color: '#3B82F6' },
    { name: 'Accepted', value: analyticsData.acceptedCount || 0, color: '#10B981' },
    { name: 'Completed', value: analyticsData.completedCount || 0, color: '#8B5CF6' }
  ];

  const categoryChartData = analyticsData.categoryData || [
    { name: 'Web Dev', value: 12, color: '#3B82F6' },
    { name: 'Mobile', value: 8, color: '#8B5CF6' },
    { name: 'AI/ML', value: 6, color: '#F59E0B' },
    { name: 'Data Science', value: 4, color: '#10B981' },
    { name: 'IoT', value: 3, color: '#EF4444' },
    { name: 'Blockchain', value: 2, color: '#06B6D4' }
  ];

  const difficultyChartData = analyticsData.difficultyData || [
    { name: 'Beginner', value: 15, color: '#10B981' },
    { name: 'Intermediate', value: 12, color: '#F59E0B' },
    { name: 'Advanced', value: 8, color: '#EF4444' }
  ];

  const applicationStatusData = analyticsData.applicationStatusData || [
    { name: 'Pending', value: 25, color: '#F59E0B' },
    { name: 'Accepted', value: 10, color: '#10B981' },
    { name: 'Rejected', value: 5, color: '#EF4444' },
    { name: 'Shortlisted', value: 8, color: '#3B82F6' }
  ];

  const monthlyApplicationsData = analyticsData.monthlyApplications || [
    { month: 'Jan', applications: 12 },
    { month: 'Feb', applications: 19 },
    { month: 'Mar', applications: 15 },
    { month: 'Apr', applications: 25 },
    { month: 'May', applications: 22 },
    { month: 'Jun', applications: 30 }
  ];

  const getCategoryIcon = (category) => {
    const icons = {
      'web-development': FaCode,
      'mobile-app': FaMobileAlt,
      'data-science': FaDatabase,
      'ai-ml': FaRocket,
      'iot': FaShieldAlt,
      'blockchain': FaTrophy,
      'cybersecurity': FaShieldAlt,
      'game-development': FaGamepad,
      'ui-ux': FaPalette
    };
    return icons[category] || FaCode;
  };

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
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{project.description}</p>
            <div className="flex items-center mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                project.status === 'modify' ? 'bg-orange-100 text-orange-800' :
                project.status === 'in-progress' || project.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {project.status}
              </span>
              {user.role === 'student' && type === 'completed' && (
                <span className="ml-2 flex items-center text-yellow-500">
                  <FaStar className="mr-1" />
                  {project.ratings?.[0]?.memberRatings?.find(r => r.member === user._id)?.rating || 'N/A'}
                </span>
              )}
            </div>
            {user.role === 'student' && type === 'completed' && project.ratings?.[0]?.comment && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Feedback:</strong> {project.ratings[0].comment}
                </p>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {user.role === 'student' && (type === 'applied' || type === 'accepted') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // View project details - could open a modal or navigate to project page
                  toast.info('View project functionality to be implemented');
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <FaEye className="mr-2" />
                View Project
              </motion.button>
            )}
            {user.role === 'student' && type === 'accepted' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSubmissionModal({ isOpen: true, project })}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <FaUpload className="mr-2" />
                Submit Project
              </motion.button>
            )}
            {user.role === 'student' && type === 'ongoing' && project.status === 'modify' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSubmissionModal({ isOpen: true, project })}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
              >
                <FaUpload className="mr-2" />
                Resubmit
              </motion.button>
            )}
            {user.role === 'industry' && type === 'ongoing' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSubmissionsModal({ isOpen: true, project })}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                >
                  <FaEye className="mr-2" />
                  View Submissions
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditModal({ isOpen: true, project })}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                >
                  <FaComment className="mr-2" />
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
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                >
                  <FaTrash className="mr-2" />
                  Delete
                </motion.button>
              </>
            )}
            {user.role === 'industry' && type === 'completed' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRatingModal({ isOpen: true, project })}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
              >
                <FaStar className="mr-2" />
                Rate Students
              </motion.button>
            )}
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          {user.role === 'student' ? (
            <>
              <span>Posted by: {project.postedBy?.name}</span>
              <span className="mx-2">•</span>
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </>
          ) : (
            <>
              <span>Status: {project.status}</span>
              <span className="mx-2">•</span>
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              {project.team && (
                <>
                  <span className="mx-2">•</span>
                  <span>Team: {project.team.members?.filter(m => m.status === 'active').length || 0} members</span>
                </>
              )}
            </>
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
            {user?.role === 'student' ? 'Track your project applications and submissions' : 'Manage your posted projects and review team submissions'}
          </p>
          {user?.role === 'student' && dashboardData?.overallRating && (
            <div className="mt-4 flex items-center">
              <span className="text-lg font-semibold text-gray-700 mr-2">Overall Rating:</span>
              <div className="flex items-center">
                <FaStar className="text-yellow-500 mr-1" />
                <span className="text-xl font-bold text-yellow-600">{dashboardData.overallRating}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Analytics Section */}
        <AnimatePresence>
          {user?.role === 'student' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              {/* Student Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  { title: 'Applied Projects', value: analyticsData.appliedCount, icon: FaClock, gradient: 'from-blue-500 to-blue-600', description: 'Applications submitted' },
                  { title: 'Accepted Projects', value: analyticsData.acceptedCount, icon: FaCheckCircle, gradient: 'from-green-500 to-emerald-500', description: 'Applications accepted' },
                  { title: 'Rejected Projects', value: rejectedProjects.length, icon: FaTimes, gradient: 'from-red-500 to-red-600', description: 'Applications rejected' },
                  { title: 'Completed Projects', value: analyticsData.completedCount, icon: FaTrophy, gradient: 'from-purple-500 to-pink-500', description: 'Projects finished' }
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
                      <p className="text-3xl font-bold mb-1">{card.value || 0}</p>
                      <p className="text-white/60 text-xs">{card.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Student Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaChartLine className="mr-2 text-blue-500" />
                    Application Trends
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyApplicationsData}>
                      <defs>
                        <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area type="monotone" dataKey="applications" stroke="#3B82F6" fillOpacity={1} fill="url(#colorApplications)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaTrophy className="mr-2 text-yellow-500" />
                    Application Journey
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
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              {/* Industry Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                {[
                  { title: 'Total Projects', value: analyticsData.totalProjects, icon: FaProjectDiagram, gradient: 'from-purple-500 to-purple-600' },
                  { title: 'Total Applications', value: analyticsData.totalApplications, icon: FaUsers, gradient: 'from-blue-500 to-cyan-500' },
                  { title: 'Active Projects', value: analyticsData.activeProjects, icon: FaFire, gradient: 'from-orange-500 to-red-500' },
                  { title: 'Completed Projects', value: analyticsData.completedCount, icon: FaCheckCircle, gradient: 'from-green-500 to-emerald-500' },
                  { title: 'Avg Rating', value: analyticsData.averageRating, icon: FaStar, gradient: 'from-yellow-500 to-amber-500' }
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

              {/* Industry Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaCode className="mr-2 text-purple-500" />
                    Projects by Category
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={categoryChartData} layout="horizontal">
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaRocket className="mr-2 text-blue-500" />
                    Difficulty Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={difficultyChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis />
                      <Radar name="Projects" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaUsers className="mr-2 text-green-500" />
                    Application Status
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={applicationStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {applicationStatusData.map((entry, index) => (
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
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaChartLine className="mr-2 text-indigo-500" />
                    Project Completion Rate
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Posted', value: analyticsData.totalProjects || 0, color: '#8B5CF6' },
                      { name: 'Active', value: analyticsData.activeProjects || 0, color: '#F59E0B' },
                      { name: 'Completed', value: analyticsData.completedCount || 0, color: '#10B981' }
                    ]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {(user?.role === 'student' ? [
                { id: 'applied', label: 'Applied Projects', count: appliedProjects.length },
                { id: 'accepted', label: 'Accepted Projects', count: analyticsData.acceptedCount || 0 },
                { id: 'rejected', label: 'Rejected Projects', count: rejectedProjects.length },
                { id: 'modifications', label: 'Modifications Requested', count: modificationRequests.length },
                { id: 'completed', label: 'Completed Projects', count: completedProjects.length }
              ] : [
                { id: 'posted', label: 'Posted Projects', count: postedProjects.length },
                { id: 'ongoing', label: 'Ongoing Projects', count: ongoingProjects.length },
                { id: 'completed', label: 'Completed Projects', count: completedProjects.length }
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {user?.role === 'student' ? (
                <>
                  {activeTab === 'applied' && renderProjects(appliedProjects, 'applied')}
                  {activeTab === 'accepted' && renderProjects(acceptedProjects, 'accepted')}
                  {activeTab === 'rejected' && renderProjects(rejectedProjects, 'rejected')}
                  {activeTab === 'modifications' && renderProjects(modificationRequests, 'ongoing')}
                  {activeTab === 'completed' && renderProjects(completedProjects, 'completed')}
                </>
              ) : (
                <>
                  {activeTab === 'posted' && renderProjects(postedProjects, 'posted')}
                  {activeTab === 'ongoing' && renderProjects(ongoingProjects, 'ongoing')}
                  {activeTab === 'completed' && renderProjects(completedProjects, 'completed')}
                </>
              )}
            </div>
          </div>
        </motion.div>

        <ProjectSubmissionModal
          isOpen={submissionModal.isOpen}
          onClose={() => setSubmissionModal({ isOpen: false, project: null })}
          project={submissionModal.project}
        />

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

export default Dashboard;
