import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  PlusIcon,
  ChevronDownIcon,
  FireIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/authStore";

const Project = () => {
  motion;
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const mockProjects = [
    {
      _id: "1",
      title: "E-commerce Analytics Dashboard",
      description:
        "Build a comprehensive analytics dashboard for an e-commerce platform using React, D3.js, and modern data visualization techniques. The dashboard should provide insights into sales trends, customer behavior, and inventory management.",
      category: "web-development",
      skillsRequired: [
        "React",
        "JavaScript",
        "D3.js",
        "Data Visualization",
        "API Integration",
      ],
      difficulty: "intermediate",
      duration: 8,
      maxTeamSize: 4,
      budget: { amount: 15000, currency: "INR" },
      postedBy: {
        name: "TechCorp Solutions",
        profile: { organization: "TechCorp Inc." },
        avatar:
          "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150",
      },
      status: "open",
      priority: "high",
      tags: ["Analytics", "Dashboard", "React"],
      views: 147,
      featured: true,
      createdAt: "2024-01-15T10:30:00Z",
      applications: [],
    },
    {
      _id: "2",
      title: "Mobile Fitness Tracking App",
      description:
        "Develop a cross-platform mobile application for fitness tracking with features like workout planning, progress monitoring, and social sharing capabilities.",
      category: "mobile-app",
      skillsRequired: [
        "React Native",
        "Node.js",
        "MongoDB",
        "Mobile Development",
      ],
      difficulty: "advanced",
      duration: 12,
      maxTeamSize: 3,
      budget: { amount: 25000, currency: "INR" },
      postedBy: {
        name: "FitLife Technologies",
        profile: { organization: "FitLife Inc." },
        avatar:
          "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=150",
      },
      status: "open",
      priority: "medium",
      tags: ["Mobile", "Fitness", "React Native"],
      views: 89,
      featured: false,
      createdAt: "2024-01-14T14:20:00Z",
      applications: [],
    },
    {
      _id: "3",
      title: "AI-Powered Chatbot for Customer Service",
      description:
        "Create an intelligent chatbot using natural language processing to handle customer inquiries and provide automated support.",
      category: "ai-ml",
      skillsRequired: [
        "Python",
        "NLP",
        "Machine Learning",
        "TensorFlow",
        "Flask",
      ],
      difficulty: "advanced",
      duration: 10,
      maxTeamSize: 2,
      budget: { amount: 20000, currency: "INR" },
      postedBy: {
        name: "InnovateHub",
        profile: { organization: "InnovateHub Ltd." },
        avatar:
          "https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?w=150",
      },
      status: "open",
      priority: "urgent",
      tags: ["AI", "Chatbot", "NLP"],
      views: 203,
      featured: true,
      createdAt: "2024-01-13T09:15:00Z",
      applications: [],
    },
    {
      _id: "4",
      title: "Blockchain Supply Chain Solution",
      description:
        "Design and implement a blockchain-based supply chain tracking system to ensure transparency and authenticity of products.",
      category: "blockchain",
      skillsRequired: ["Solidity", "Ethereum", "Web3.js", "Smart Contracts"],
      difficulty: "advanced",
      duration: 14,
      maxTeamSize: 5,
      budget: { amount: 35000, currency: "INR" },
      postedBy: {
        name: "ChainTech Solutions",
        profile: { organization: "ChainTech Corp." },
      },
      status: "open",
      priority: "high",
      tags: ["Blockchain", "Supply Chain", "Smart Contracts"],
      views: 156,
      featured: false,
      createdAt: "2024-01-12T16:45:00Z",
      applications: [],
    },
    {
      _id: "5",
      title: "IoT Smart Home Management System",
      description:
        "Build a comprehensive IoT system for smart home automation including device control, energy monitoring, and security features.",
      category: "iot",
      skillsRequired: ["Arduino", "Raspberry Pi", "Python", "IoT", "MQTT"],
      difficulty: "intermediate",
      duration: 9,
      maxTeamSize: 4,
      budget: { amount: 18000, currency: "INR" },
      postedBy: {
        name: "SmartLiving Tech",
        profile: { organization: "SmartLiving Inc." },
      },
      status: "open",
      priority: "medium",
      tags: ["IoT", "Smart Home", "Automation"],
      views: 92,
      featured: false,
      createdAt: "2024-01-11T11:30:00Z",
      applications: [],
    },
    {
      _id: "6",
      title: "Game Development: 2D Puzzle Adventure",
      description:
        "Create an engaging 2D puzzle adventure game with compelling storyline, character development, and innovative gameplay mechanics.",
      category: "game-development",
      skillsRequired: ["Unity", "C#", "Game Design", "2D Art", "Animation"],
      difficulty: "intermediate",
      duration: 11,
      maxTeamSize: 6,
      budget: { amount: 22000, currency: "INR" },
      postedBy: {
        name: "GameStudio Pro",
        profile: { organization: "GameStudio Ltd." },
      },
      status: "open",
      priority: "low",
      tags: ["Game", "2D", "Unity"],
      views: 134,
      featured: false,
      createdAt: "2024-01-10T13:20:00Z",
      applications: [],
    },
  ];

  useEffect(() => {
    // Simulate API call with beautiful loading animation
    const timer = setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "web-development", label: "Web Development" },
    { value: "mobile-app", label: "Mobile App" },
    { value: "data-science", label: "Data Science" },
    { value: "ai-ml", label: "AI/ML" },
    { value: "iot", label: "IoT" },
    { value: "blockchain", label: "Blockchain" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "game-development", label: "Game Development" },
    { value: "ui-ux", label: "UI/UX Design" },
  ];

  const difficulties = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "open", label: "Open" },
    { value: "assigned", label: "Assigned" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Newest First" },
    { value: "views", label: "Most Viewed" },
    { value: "applications", label: "Most Applied" },
    { value: "budget", label: "Highest Budget" },
    { value: "duration", label: "Shortest Duration" },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "bg-blue-100 text-blue-800";
      case "intermediate":
        return "bg-purple-100 text-purple-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.skillsRequired.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || project.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || project.difficulty === selectedDifficulty;
    const matchesStatus =
      selectedStatus === "all" || project.status === selectedStatus;

    return (
      matchesSearch && matchesCategory && matchesDifficulty && matchesStatus
    );
  });

  const ProjectCard = ({ project, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 },
      }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

      {/* Featured ribbon */}
      {project.featured && (
        <div className="absolute top-4 right-4 z-10">
          <motion.div
            initial={{ scale: 0, rotate: 45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg flex items-center"
          >
            <FireIcon className="h-4 w-4 mr-1" />
            Featured
          </motion.div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(
                  project.priority
                )}`}
              >
                {project.priority}
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(
                  project.difficulty
                )}`}
              >
                {project.difficulty}
              </motion.span>
            </div>
            <motion.h3
              whileHover={{ color: "#2563eb" }}
              className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2"
            >
              {project.title}
            </motion.h3>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span>{project.views}</span>
            <span>views</span>
          </div>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className="text-gray-600 text-sm line-clamp-3 mb-4"
        >
          {project.description}
        </motion.p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skillsRequired.slice(0, 4).map((skill, skillIndex) => (
            <motion.span
              key={skillIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + skillIndex * 0.05 + 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 cursor-default"
            >
              {skill}
            </motion.span>
          ))}
          {project.skillsRequired.length > 4 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600"
            >
              +{project.skillsRequired.length - 4} more
            </motion.span>
          )}
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="flex items-center space-x-2 text-sm text-gray-600"
          >
            <ClockIcon className="h-4 w-4" />
            <span>{project.duration} weeks</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.45 }}
            className="flex items-center space-x-2 text-sm text-gray-600"
          >
            <UserGroupIcon className="h-4 w-4" />
            <span>Up to {project.maxTeamSize} members</span>
          </motion.div>
          {project.budget && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="flex items-center space-x-2 text-sm text-gray-600 col-span-2"
            >
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>₹{project.budget.amount.toLocaleString()}</span>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.6 }}
            className="flex items-center space-x-2"
          >
            {project.postedBy.avatar ? (
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={project.postedBy.avatar}
                alt={project.postedBy.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center"
              >
                <span className="text-white text-sm font-medium">
                  {project.postedBy.name.charAt(0)}
                </span>
              </motion.div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {project.postedBy.name}
              </p>
              {project.postedBy.profile?.organization && (
                <p className="text-xs text-gray-500">
                  {project.postedBy.profile.organization}
                </p>
              )}
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={`/projects/${project._id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              View Details
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="animate-pulse"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "64" }}
              transition={{ duration: 0.8 }}
              className="h-8 bg-gradient-to-r from-blue-200 to-indigo-200 rounded w-64 mb-8"
            ></motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-sm"
                >
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6 mb-4"></div>
                  <div className="flex space-x-2 mb-4">
                    <div className="h-6 bg-gradient-to-r from-blue-200 to-indigo-200 rounded w-16"></div>
                    <div className="h-6 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-20"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-18"></div>
                  </div>
                  <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Project Marketplace
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600"
            >
              Discover exciting projects to work on
            </motion.p>
          </div>
          {user?.role === "industry" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link
                to="/projects/new"
                className="mt-4 lg:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Post New Project
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1 relative"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects, skills, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </motion.div>

            {/* Filter Toggle */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filters
              <ChevronDownIcon
                className={`h-4 w-4 ml-2 transform transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </motion.button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    >
                      {difficulties.map((difficulty) => (
                        <option key={difficulty.value} value={difficulty.value}>
                          {difficulty.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    >
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project._id} project={project} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
              className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4"
            >
              <FunnelIcon className="h-12 w-12 text-blue-500" />
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters to find more
              projects.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedDifficulty("all");
                setSelectedStatus("all");
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Project;
