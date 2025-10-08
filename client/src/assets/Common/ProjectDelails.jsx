import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  TagIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  DocumentTextIcon,
  StarIcon,
  LinkIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UsersIcon,
  PlusIcon,
  MinusIcon,
  ChartBarIcon,
  TrophyIcon,
  LightBulbIcon,
  CodeBracketIcon,
  CloudArrowUpIcon,
  PlayIcon,
  PauseIcon,
  DocumentArrowUpIcon,
  ShareIcon,
  BookmarkIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
  ClipboardDocumentListIcon,
  RocketLaunchIcon,
  CogIcon,
  BellIcon,
  FlagIcon,
  CheckBadgeIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useApplicationStore } from '../../store/applicationStore';
import ProjectApplicationForm from './ProjectApplicationForm';
import toast from 'react-hot-toast';

const ProjectDelails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentProject, loading, getProjectById, updateProject } = useProjectStore();
  const { applyToProject } = useApplicationStore();

  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationText, setApplicationText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [applicationLoading, setApplicationLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        await getProjectById(id);
      } catch (error) {
        console.error('Failed to fetch project:', error);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id, getProjectById]);

  useEffect(() => {
    if (currentProject) {
      setEditForm({
        title: currentProject.title || '',
        description: currentProject.description || '',
        category: currentProject.category || '',
        skillsRequired: currentProject.skillsRequired || [],
        difficulty: currentProject.difficulty || '',
        duration: currentProject.duration || 1,
        maxTeamSize: currentProject.maxTeamSize || 1,
        deadline: currentProject.deadline ? new Date(currentProject.deadline).toISOString().split('T')[0] : '',
        tags: currentProject.tags || []
      });
    }
  }, [currentProject]);

  const handleApply = async () => {
    if (!applicationText.trim()) return;
    setShowApplicationModal(false);
    setApplicationText('');
    // Simulate application submission
  };

  const handleApplicationSubmit = async (applicationData) => {
    setApplicationLoading(true);
    try {
      await applyToProject(currentProject._id, applicationData);

      // Refresh project data to show updated application status
      await getProjectById(currentProject._id);
      setShowApplicationForm(false);

      // Show success message
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setApplicationLoading(false);
    }
  };



  const isRegistrationOpen = () => {
    if (!currentProject) return false;
    // If no deadline set, project is open only if status is 'open'
    if (!currentProject.deadline) return currentProject.status === 'open';
    const now = new Date();
    const deadline = new Date(currentProject.deadline);
    return now < deadline && currentProject.status === 'open';
  };

  const hasUserApplied = () => {
    if (!user || !currentProject || !currentProject.applications) return false;
    return currentProject.applications.some(app =>
      app.applicant && app.applicant._id === user._id
    );
  };

  const isProjectOwner = () => {
    return user && currentProject && currentProject.postedBy._id === user._id;
  };

  const handleEditSubmit = async () => {
    try {
      await updateProject(currentProject._id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleToggleRegistration = async () => {
    try {
      const newStatus = currentProject.status === 'open' ? 'closed' : 'open';
      await updateProject(currentProject._id, { status: newStatus });
      // Refresh project data
      await getProjectById(currentProject._id);
    } catch (error) {
      console.error('Failed to toggle registration:', error);
      toast.error('Failed to update registration status');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `Check out this project: ${currentProject.title}`;
    const text = `Join this exciting ${currentProject.category} project - ${currentProject.description.substring(0, 100)}...`;

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        fallbackShare(url);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      fallbackShare(url);
    }
  };

  const fallbackShare = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Project link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Last resort: show the URL in a toast
      toast.error(`Copy this link to share: ${url}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="animate-pulse space-y-8"
          >
            <div className="h-8 bg-slate-600/30 rounded-lg w-64"></div>
            <div className="bg-slate-700/20 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/30">
              <div className="h-12 bg-slate-600/30 rounded-lg w-3/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-600/30 rounded w-full"></div>
                <div className="h-4 bg-slate-600/30 rounded w-5/6"></div>
                <div className="h-4 bg-slate-600/30 rounded w-4/6"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!currentProject && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <ExclamationTriangleIcon className="mx-auto h-24 w-24 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Project Not Found
            </h3>
            <p className="text-gray-300 mb-6">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/projects')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Back to Projects
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!currentProject) return null;

  return (
    <>
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/15 to-slate-400/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/projects')}
          className="mb-8 inline-flex items-center text-white/80 hover:text-white transition-all duration-200 bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-600/50"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Projects
        </motion.button>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Project Info - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Project Header Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
              {/* Featured Banner */}
              {currentProject.featured && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3"
                >
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center">
                      <FireIcon className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Featured Opportunity</span>
                    </div>
                    {currentProject.priority === 'urgent' && (
                      <div className="flex items-center">
                        <SparklesIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Urgent Hiring</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="p-8">
                {/* Title and Company */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                    {currentProject.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-300">
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="h-5 w-5" />
                      <span className="font-medium">{currentProject.postedBy.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5" />
                      <span>Deadline: {currentProject.deadline ? new Date(currentProject.deadline).toLocaleDateString() : 'Not set'}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Key Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <TagIcon className="h-5 w-5 text-green-400" />
                      <span className="text-sm text-gray-300">Category</span>
                    </div>
                    <p className="text-lg font-bold text-white">{currentProject.category}</p>
                    <p className="text-xs text-gray-400">type</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <ClockIcon className="h-5 w-5 text-blue-400" />
                      <span className="text-sm text-gray-300">Duration</span>
                    </div>
                    <p className="text-lg font-bold text-white">{currentProject.duration} weeks</p>
                    <p className="text-xs text-gray-400">project length</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserGroupIcon className="h-5 w-5 text-purple-400" />
                      <span className="text-sm text-gray-300">Team Size</span>
                    </div>
                    <p className="text-lg font-bold text-white">{currentProject.maxTeamSize}</p>
                    <p className="text-xs text-gray-400">max members</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <EyeIcon className="h-5 w-5 text-cyan-400" />
                      <span className="text-sm text-gray-300">Status</span>
                    </div>
                    <p className="text-lg font-bold text-white">{currentProject.status}</p>
                    <p className="text-xs text-gray-400">current state</p>
                  </div>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Project Description</h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {currentProject.description}
                  </p>
                </motion.div>

                {/* Skills Required */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mb-8"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Skills Required</h3>
                  <div className="flex flex-wrap gap-3">
                    {currentProject.skillsRequired.map((skill, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        whileHover={{
                          scale: 1.1,
                          rotate: 2,
                          boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 rounded-xl border border-blue-500/30 font-medium cursor-pointer"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
                >
                  {!hasUserApplied() && isRegistrationOpen() && user?.role === 'student' && (
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowApplicationForm(true)}
                      className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-sm sm:text-base"
                    >
                      <PaperAirplaneIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                      Apply Now
                    </motion.button>
                  )}

                  {user?.role === 'student' && !isRegistrationOpen() && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl shadow-lg"
                    >
                      <XCircleIcon className="h-6 w-6 mr-3" />
                      Registration Closed
                    </motion.div>
                  )}

                  {isProjectOwner() && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/projects/${currentProject._id}/applicants`)}
                          className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-sm sm:text-base"
                      >
                        <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        View Applicants ({currentProject.applications?.length || 0})
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggleRegistration}
                        className={`inline-flex items-center px-4 py-2 sm:px-6 sm:py-4 font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-sm sm:text-base ${
                          currentProject.status === 'open'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white'
                        }`}
                      >
                        {currentProject.status === 'open' ? (
                          <>
                            <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Close Registration
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Open Registration
                          </>
                        )}
                      </motion.button>


                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(!isEditing)}
                        className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-sm sm:text-base"
                      >
                        <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        {isEditing ? 'Cancel Edit' : 'Edit Project'}
                      </motion.button>
                    </>
                  )}


                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`inline-flex items-center px-4 py-2 sm:px-6 sm:py-4 rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base ${
                      isBookmarked
                        ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/50'
                        : 'bg-slate-700/50 text-gray-300 border-2 border-slate-600/50 hover:bg-slate-600/50'
                    }`}
                  >
                    <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </motion.button>


                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare()}
                    className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-4 bg-slate-700/50 text-gray-300 border-2 border-slate-600/50 rounded-2xl font-medium hover:bg-slate-600/50 transition-all duration-300 text-sm sm:text-base"
                  >
                    <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Share
                  </motion.button>
                </motion.div>
              </div>
            </div>


          </motion.div>

          {/* Right Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Project Poster Info */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 sticky top-8">
              <div className="text-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative inline-block"
                >
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mx-auto border-4 border-cyan-400/50">
                    <span className="text-white text-2xl font-bold">
                      {currentProject.postedBy.name.charAt(0)}
                    </span>
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold text-white mt-4">
                  {currentProject.postedBy.name}
                </h3>
                <p className="text-cyan-200">Project Poster</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-300">Posted</span>
                  <span className="text-white font-medium">{new Date(currentProject.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-300">Status</span>
                  <span className="text-white font-medium">{currentProject.status}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-300">Priority</span>
                  <span className="text-white font-medium">{currentProject.priority || 'Medium'}</span>
                </div>
                {currentProject.deadline && (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-gray-300">Deadline</span>
                    <span className="text-white font-medium">{new Date(currentProject.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Project Tags */}
            {currentProject.tags && currentProject.tags.length > 0 && (
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProject.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}


          </motion.div>
        </div>

        {/* Application Modal */}
        <AnimatePresence>
          {showApplicationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                className="bg-slate-800/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <PaperAirplaneIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-2">Apply for this Position</h3>
                  <p className="text-gray-400">Tell us why you're the perfect fit for this role</p>
                </div>
                
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Cover Letter / Why should we hire you?
                  </label>
                  <textarea
                    value={applicationText}
                    onChange={(e) => setApplicationText(e.target.value)}
                    rows={8}
                    className="block w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                    placeholder="Share your experience, skills, and passion for mobile development. What makes you the ideal candidate for this role?"
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    {applicationText.length}/1000 characters
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowApplicationModal(false)}
                    className="px-8 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApply}
                    disabled={!applicationText.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Submit Application
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        {!hasUserApplied() && isRegistrationOpen() && user?.role === 'student' && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.5, type: "spring" }}
            className="fixed bottom-8 right-8 z-40"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowApplicationForm(true)}
              className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-green-500/25 transition-all duration-300"
            >
              <PaperAirplaneIcon className="h-8 w-8" />
            </motion.button>
          </motion.div>
        )}

        {/* Deadline Warning */}
        {isRegistrationOpen() && currentProject.deadline && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="fixed bottom-8 left-8 bg-orange-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl border border-orange-400/50 z-40"
          >
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5" />
              <span className="font-medium">
                Registration closes: {new Date(currentProject.deadline).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        )}

        {/* Project Application Form */}
        <ProjectApplicationForm
          project={currentProject}
          isOpen={showApplicationForm}
          onClose={() => setShowApplicationForm(false)}
          onSubmit={handleApplicationSubmit}
          loading={applicationLoading}
        />

        {/* Edit Project Modal */}
        <AnimatePresence>
          {isEditing && isProjectOwner() && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              style={{ alignItems: 'center', justifyContent: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                className="bg-gray-800/95 backdrop-blur-xl rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-600/50 hide-scrollbar mx-auto mt-8"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <PencilIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-2">Edit Project</h3>
                  <p className="text-gray-400">Update your project details</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      >
                        <option value="web-development">Web Development</option>
                        <option value="mobile-app">Mobile App</option>
                        <option value="data-science">Data Science</option>
                        <option value="ai-ml">AI/ML</option>
                        <option value="iot">IoT</option>
                        <option value="blockchain">Blockchain</option>
                        <option value="cybersecurity">Cybersecurity</option>
                        <option value="game-development">Game Development</option>
                        <option value="ui-ux">UI/UX</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duration (weeks)</label>
                      <input
                        type="number"
                        value={editForm.duration}
                        onChange={(e) => setEditForm({...editForm, duration: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Team Size</label>
                      <input
                        type="number"
                        value={editForm.maxTeamSize}
                        onChange={(e) => setEditForm({...editForm, maxTeamSize: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                      <input
                        type="date"
                        value={editForm.deadline}
                        onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Skills Required (comma-separated)</label>
                    <input
                      type="text"
                      value={editForm.skillsRequired.join(', ')}
                      onChange={(e) => setEditForm({...editForm, skillsRequired: e.target.value.split(',').map(s => s.trim())})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                    >
                      Save Changes
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
    </>
  );
};

export default ProjectDelails;
