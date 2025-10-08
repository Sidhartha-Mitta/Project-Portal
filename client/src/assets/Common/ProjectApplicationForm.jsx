import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  DocumentArrowUpIcon,
  PaperAirplaneIcon,
  UserIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  LinkIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  StarIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const ProjectApplicationForm = ({ project, isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    institute: '',
    availability: 'negotiable',
    skills: [],
    experience: '',
    portfolio: '',
    phone: '',
    address: '',
    cgpa: '',
    yearOfStudy: '3rd'
  });

  const [skillInput, setSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const availabilityOptions = [
    { value: 'immediate', label: 'Immediate', icon: '⚡' },
    { value: '2-weeks', label: 'Within 2 weeks', icon: '📅' },
    { value: '1-month', label: 'Within 1 month', icon: '🗓️' },
    { value: 'negotiable', label: 'Negotiable', icon: '🤝' }
  ];

  const yearOptions = [
    { value: '1st', label: '1st Year' },
    { value: '2nd', label: '2nd Year' },
    { value: '3rd', label: '3rd Year' },
    { value: '4th', label: '4th Year' },
    { value: 'Graduate', label: 'Graduate' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileUpload = (file) => {
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setResumePreview({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
      setErrors(prev => ({ ...prev, resume: '' }));
    } else {
      setErrors(prev => ({ ...prev, resume: 'Please upload a PDF file' }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!resumeFile) newErrors.resume = 'Resume is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required';
    }

    if (step === 2) {
      if (!formData.experience.trim()) newErrors.experience = 'Experience description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 2));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    const applicationData = {
      ...formData,
      resumeFile
    };

    await onSubmit(applicationData);
  };

  const resetForm = () => {
    setFormData({
      institute: '',
      availability: 'negotiable',
      skills: [],
      experience: '',
      portfolio: '',
      phone: '',
      address: '',
      cgpa: '',
      yearOfStudy: '3rd'
    });
    setSkillInput('');
    setResumeFile(null);
    setResumePreview(null);
    setCurrentStep(1);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 max-w-2xl sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2"
              >
                Apply for Project
              </motion.h2>
              <p className="text-gray-400">{project?.title}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <XMarkIcon className="h-6 w-6" />
            </motion.button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <motion.div
                  animate={{
                    backgroundColor: currentStep >= step ? '#3B82F6' : '#374151',
                    scale: currentStep === step ? 1.1 : 1
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 ${
                    currentStep >= step ? 'border-blue-500' : 'border-gray-600'
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    step
                  )}
                </motion.div>
                {step < 2 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Application */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <DocumentArrowUpIcon className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-white">Upload Resume & Basic Info</h3>
                    <p className="text-gray-400">Share your resume and contact information</p>
                  </div>

                  {/* Resume Upload */}
                  <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <DocumentArrowUpIcon className="h-5 w-5 inline mr-2" />
                      Upload Resume (PDF) *
                    </label>

                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive
                          ? 'border-blue-500 bg-blue-500/10'
                          : errors.resume
                            ? 'border-red-500 bg-red-500/5'
                            : 'border-white/30 hover:border-blue-400 hover:bg-white/5'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />

                      {resumePreview ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center justify-center space-x-4"
                        >
                          <div className="p-3 bg-green-500/20 rounded-full">
                            <DocumentArrowUpIcon className="h-8 w-8 text-green-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-medium">{resumePreview.name}</p>
                            <p className="text-gray-400 text-sm">{resumePreview.size}</p>
                          </div>
                          <CheckCircleIcon className="h-6 w-6 text-green-400" />
                        </motion.div>
                      ) : (
                        <div>
                          <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-white font-medium mb-2">Drop your resume here or click to browse</p>
                          <p className="text-gray-400 text-sm">PDF files only, max 10MB</p>
                        </div>
                      )}
                    </div>

                    {errors.resume && (
                      <p className="text-red-400 text-sm mt-2 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.resume}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Phone */}
                    <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        <PhoneIcon className="h-5 w-5 inline mr-2" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-sm mt-2">{errors.phone}</p>
                      )}
                    </div>

                    {/* Year of Study */}
                    <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        <AcademicCapIcon className="h-5 w-5 inline mr-2" />
                        Year of Study
                      </label>
                      <select
                        name="yearOfStudy"
                        value={formData.yearOfStudy}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {yearOptions.map(option => (
                          <option key={option.value} value={option.value} className="bg-gray-800">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <StarIcon className="h-5 w-5 inline mr-2" />
                      Technical Skills *
                    </label>
                    <div className="flex gap-3 mb-4">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a skill (e.g., React, Python, UI/UX)"
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addSkill}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                      >
                        Add
                      </motion.button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.skills.map((skill, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-blue-500/20 text-blue-200 border border-blue-400/30"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-blue-300 hover:text-blue-100 transition-colors"
                          >
                            ×
                          </button>
                        </motion.span>
                      ))}
                    </div>
                    {errors.skills && (
                      <p className="text-red-400 text-sm flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.skills}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Skills & Experience */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <BriefcaseIcon className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-white">Experience & Additional Details</h3>
                    <p className="text-gray-400">Tell us about your experience and availability</p>
                  </div>

                  {/* Experience */}
                  <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <BriefcaseIcon className="h-5 w-5 inline mr-2" />
                      Relevant Experience *
                    </label>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                        errors.experience ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Describe your relevant experience, projects, internships, or coursework..."
                    />
                    {errors.experience && (
                      <p className="text-red-400 text-sm mt-2">{errors.experience}</p>
                    )}
                  </div>

                  {/* Portfolio */}
                  <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <LinkIcon className="h-5 w-5 inline mr-2" />
                      Portfolio/GitHub URL
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://github.com/yourusername or https://yourportfolio.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Institute */}
                    <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        <AcademicCapIcon className="h-5 w-5 inline mr-2" />
                        Institute/University
                      </label>
                      <input
                        type="text"
                        name="institute"
                        value={formData.institute}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., IIT Delhi, MIT, etc."
                      />
                    </div>

                    {/* CGPA */}
                    <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        <AcademicCapIcon className="h-5 w-5 inline mr-2" />
                        CGPA (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name="cgpa"
                        value={formData.cgpa}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="8.5"
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      <ClockIcon className="h-5 w-5 inline mr-2" />
                      Availability
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availabilityOptions.map((option) => (
                        <motion.label
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            formData.availability === option.value
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-white/20 hover:border-purple-400 hover:bg-white/5'
                          }`}
                        >
                          <input
                            type="radio"
                            name="availability"
                            value={option.value}
                            checked={formData.availability === option.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <span className="text-2xl mr-3">{option.icon}</span>
                          <span className="text-white font-medium">{option.label}</span>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <MapPinIcon className="h-5 w-5 inline mr-2" />
                      Address (Optional)
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Your current address..."
                    />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between pt-6 sm:pt-8 border-t border-white/20 gap-4 sm:gap-0">
              <div className="order-2 sm:order-1">
                {currentStep > 1 && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevStep}
                    className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all duration-200 text-sm sm:text-base"
                  >
                    Previous
                  </motion.button>
                )}
              </div>

              <div className="flex space-x-2 sm:space-x-4 order-1 sm:order-2 justify-end">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all duration-200 text-sm sm:text-base"
                >
                  Cancel
                </motion.button>

                {currentStep < 2 ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextStep}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base"
                  >
                    Next Step
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading}
                    className="px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm sm:text-base"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <PaperAirplaneIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Submit Application
                      </div>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectApplicationForm;