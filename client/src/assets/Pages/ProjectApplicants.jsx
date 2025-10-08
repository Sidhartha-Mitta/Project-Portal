import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UsersIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BarsArrowUpIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { useApplicationStore } from '../../store/applicationStore';
import { useProjectStore } from '../../store/projectStore';
import { useTeamStore } from '../../store/teamStore';
import toast from 'react-hot-toast';

const ProjectApplicants = () => {
  console.log('ProjectApplicants component loaded successfully');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projectApplications, loading: appLoading, error: appError, getProjectApplications, updateApplicationStatus: updateAppStatus } = useApplicationStore();
  const { currentProject, loading: projLoading, error: projError, getProjectById } = useProjectStore();
  const { getTeams } = useTeamStore();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('appliedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [actionLoading, setActionLoading] = useState(false);

  const loading = appLoading || projLoading;
  const error = appError || projError;
  const applications = projectApplications;
  const project = currentProject;

  const statusOptions = [
    { value: 'all', label: 'All Applications', color: 'gray' },
    { value: 'pending', label: 'Pending Review', color: 'yellow' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'blue' },
    { value: 'accepted', label: 'Accepted', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' }
  ];

  const sortOptions = [
    { value: 'appliedAt', label: 'Application Date' },
    { value: 'name', label: 'Name' },
    { value: 'experience', label: 'Experience' },
    { value: 'skills', label: 'Skills Match' }
  ];

  useEffect(() => {
    getProjectApplications(id);
    getProjectById(id);
  }, [id, getProjectApplications, getProjectById]);

  const handleUpdateApplicationStatus = async (applicationId, status, feedback = null) => {
    try {
      setActionLoading(true);
      await updateAppStatus(id, applicationId, status);
      setSelectedApplication(null);

      // Refresh teams list if application was accepted (to show new team)
      if (status === 'accepted') {
        await getTeams();
      }

      // Show success message
      const statusMessages = {
        accepted: 'Application accepted! Student has been added to the project team.',
        rejected: 'Application rejected.',
        shortlisted: 'Application shortlisted for further review.'
      };

      toast.success(statusMessages[status] || 'Application status updated successfully!');
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error(error.message || 'Failed to update application');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAndSortedApplications = applications
    .filter(app => {
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      const matchesSearch = !searchTerm || 
        app.applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.skills && app.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.applicant.name.toLowerCase();
          bValue = b.applicant.name.toLowerCase();
          break;
        case 'appliedAt':
          aValue = new Date(a.appliedAt);
          bValue = new Date(b.appliedAt);
          break;
        case 'experience':
          aValue = a.experience?.length || 0;
          bValue = b.experience?.length || 0;
          break;
        case 'skills':
          aValue = a.skills?.length || 0;
          bValue = b.skills?.length || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      shortlisted: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      accepted: 'bg-green-500/20 text-green-300 border-green-500/50',
      rejected: 'bg-red-500/20 text-red-300 border-red-500/50'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4" />;
      case 'shortlisted':
        return <StarIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-slate-600/30 border-t-slate-400 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Applications</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
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
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ x: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white">Project Applicants</h1>
              <p className="text-gray-300">{project?.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <span className="text-white font-medium">{filteredAndSortedApplications.length} Applications</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="relative">
              <BarsArrowUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                <BarsArrowUpIcon className={`h-5 w-5 mr-2 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        {filteredAndSortedApplications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Applications Found</h3>
            <p className="text-gray-400">
              {applications.length === 0 
                ? "No one has applied to this project yet." 
                : "No applications match your current filters."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedApplications.map((application, index) => (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 cursor-pointer hover:bg-white/15 transition-all duration-300"
                onClick={() => setSelectedApplication(application)}
              >
                {/* Applicant Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {application.applicant.name.charAt(0)}
                      </span>
                    </div>
                    {application.status === 'accepted' && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{application.applicant.name}</h3>
                    <p className="text-gray-400 text-sm">{application.applicant.email}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    <span className="capitalize">{application.status}</span>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-300 text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Applied {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                  
                  {application.phone && (
                    <div className="flex items-center text-gray-300 text-sm">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      {application.phone}
                    </div>
                  )}

                  {application.cgpa && (
                    <div className="flex items-center text-gray-300 text-sm">
                      <AcademicCapIcon className="h-4 w-4 mr-2" />
                      CGPA: {application.cgpa}/10
                    </div>
                  )}

                  {application.availability && (
                    <div className="flex items-center text-gray-300 text-sm">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Available: {application.availability}
                    </div>
                  )}
                </div>

                {/* Skills Preview */}
                {application.skills && application.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {application.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded-lg text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {application.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-lg text-xs">
                          +{application.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}


                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApplication(application);
                    }}
                    className="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl hover:bg-cyan-500/30 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Details
                  </motion.button>
                  
                  {application.status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateApplicationStatus(application._id, 'shortlisted');
                      }}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <StarIcon className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Application Detail Modal */}
        <AnimatePresence>
          {selectedApplication && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedApplication(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {selectedApplication.applicant.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedApplication.applicant.name}</h2>
                      <p className="text-gray-400">{selectedApplication.applicant.email}</p>
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getStatusColor(selectedApplication.status)}`}>
                        {getStatusIcon(selectedApplication.status)}
                        <span className="capitalize">{selectedApplication.status}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Application Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <UserIcon className="h-5 w-5 mr-2" />
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-300">
                          <EnvelopeIcon className="h-4 w-4 mr-3" />
                          {selectedApplication.applicant.email}
                        </div>
                        {selectedApplication.phone && (
                          <div className="flex items-center text-gray-300">
                            <PhoneIcon className="h-4 w-4 mr-3" />
                            {selectedApplication.phone}
                          </div>
                        )}
                        {selectedApplication.address && (
                          <div className="flex items-center text-gray-300">
                            <MapPinIcon className="h-4 w-4 mr-3" />
                            {selectedApplication.address}
                          </div>
                        )}
                        {selectedApplication.portfolio && (
                          <div className="flex items-center text-gray-300">
                            <LinkIcon className="h-4 w-4 mr-3" />
                            <a 
                              href={selectedApplication.portfolio} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              Portfolio/GitHub
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <AcademicCapIcon className="h-5 w-5 mr-2" />
                        Academic Information
                      </h3>
                      <div className="space-y-3">
                        {selectedApplication.yearOfStudy && (
                          <div className="flex items-center text-gray-300">
                            <span className="font-medium mr-2">Year of Study:</span>
                            {selectedApplication.yearOfStudy}
                          </div>
                        )}
                        {selectedApplication.cgpa && (
                          <div className="flex items-center text-gray-300">
                            <span className="font-medium mr-2">CGPA:</span>
                            {selectedApplication.cgpa}/10
                          </div>
                        )}
                        {selectedApplication.applicant.profile && selectedApplication.applicant.profile.branch && (
                          <div className="flex items-center text-gray-300">
                            <span className="font-medium mr-2">Branch:</span>
                            {selectedApplication.applicant.profile.branch}
                          </div>
                        )}
                        {selectedApplication.applicant.profile && selectedApplication.applicant.profile.education && (
                          <div className="flex items-center text-gray-300">
                            <span className="font-medium mr-2">Education:</span>
                            {selectedApplication.applicant.profile.education}
                          </div>
                        )}
                        {selectedApplication.applicant.profile && selectedApplication.applicant.profile.studentId && (
                          <div className="flex items-center text-gray-300">
                            <span className="font-medium mr-2">Student ID:</span>
                            {selectedApplication.applicant.profile.studentId}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile Information */}
                    {selectedApplication.applicant.profile && (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <UserIcon className="h-5 w-5 mr-2" />
                          Profile Information
                        </h3>
                        <div className="space-y-3">
                          {selectedApplication.applicant.profile.bio && selectedApplication.applicant.profile.bio !== "This is a sample bio." && (
                            <div className="text-gray-300">
                              <span className="font-medium">Bio:</span>
                              <p className="mt-1">{selectedApplication.applicant.profile.bio}</p>
                            </div>
                          )}
                          {selectedApplication.applicant.profile.rating && (
                            <div className="flex items-center text-gray-300">
                              <span className="font-medium mr-2">Rating:</span>
                              <div className="flex items-center">
                                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                <span>{selectedApplication.applicant.profile.rating}/5</span>
                              </div>
                            </div>
                          )}
                          {selectedApplication.applicant.profile.linkedin && selectedApplication.applicant.profile.linkedin !== "https://linkedin.com/in/example" && (
                            <div className="flex items-center text-gray-300">
                              <LinkIcon className="h-4 w-4 mr-3" />
                              <a
                                href={selectedApplication.applicant.profile.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              >
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                          {selectedApplication.applicant.profile.github && selectedApplication.applicant.profile.github !== "https://github.com/example" && (
                            <div className="flex items-center text-gray-300">
                              <LinkIcon className="h-4 w-4 mr-3" />
                              <a
                                href={selectedApplication.applicant.profile.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              >
                                GitHub Profile
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Application Details */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <BriefcaseIcon className="h-5 w-5 mr-2" />
                        Application Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-300">
                          <CalendarIcon className="h-4 w-4 mr-3" />
                          Applied on {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                        </div>
                        {selectedApplication.cgpa && (
                          <div className="flex items-center text-gray-300">
                            <AcademicCapIcon className="h-4 w-4 mr-3" />
                            CGPA: {selectedApplication.cgpa}/10
                          </div>
                        )}
                        {selectedApplication.availability && (
                          <div className="flex items-center text-gray-300">
                            <ClockIcon className="h-4 w-4 mr-3" />
                            Availability: {selectedApplication.availability}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resume */}
                    {selectedApplication.resume && (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                          Resume
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-8 w-8 text-red-400 mr-3" />
                            <div>
                              <p className="text-white font-medium">{selectedApplication.resume.filename}</p>
                              <p className="text-gray-400 text-sm">
                                Uploaded {new Date(selectedApplication.resume.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <a
                            href={selectedApplication.resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors flex items-center"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Skills */}
                    {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <SparklesIcon className="h-5 w-5 mr-2" />
                          Technical Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-2 bg-blue-500/20 text-blue-200 rounded-xl text-sm font-medium border border-blue-400/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}


                    {/* Experience */}
                    {selectedApplication.experience && (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <BriefcaseIcon className="h-5 w-5 mr-2" />
                          Relevant Experience
                        </h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {selectedApplication.experience}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-white/20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateApplicationStatus(selectedApplication._id, 'rejected')}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-red-500/20 text-red-300 border border-red-500/50 rounded-xl hover:bg-red-500/30 transition-colors font-medium flex items-center"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Reject
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateApplicationStatus(selectedApplication._id, 'shortlisted')}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-blue-500/20 text-blue-300 border border-blue-500/50 rounded-xl hover:bg-blue-500/30 transition-colors font-medium flex items-center"
                    >
                      <StarIcon className="h-5 w-5 mr-2" />
                      Shortlist
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateApplicationStatus(selectedApplication._id, 'accepted')}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg flex items-center"
                    >
                      {actionLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                      )}
                      Accept & Add to Team
                    </motion.button>
                  </div>
                )}

                {selectedApplication.status === 'shortlisted' && (
                  <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-white/20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateApplicationStatus(selectedApplication._id, 'rejected')}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-red-500/20 text-red-300 border border-red-500/50 rounded-xl hover:bg-red-500/30 transition-colors font-medium flex items-center"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Reject
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateApplicationStatus(selectedApplication._id, 'accepted')}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg flex items-center"
                    >
                      {actionLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                      )}
                      Accept & Add to Team
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectApplicants;