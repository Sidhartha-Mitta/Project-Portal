import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  FireIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const ProjectCard = ({ project, index }) => {
  motion;

  // Check if user has applied to this project
  const hasUserApplied = () => {
    return project.applications && project.applications.length > 0;
  };
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

  return (
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
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group relative flex flex-col h-full"
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

      {/* Applied indicator */}
      {hasUserApplied() && (
        <div className="absolute top-4 left-4 z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg flex items-center"
          >
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Applied
          </motion.div>
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        {/* Header - Fixed height */}
        <div className="flex items-start justify-between mb-4 min-h-[80px]">
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

        {/* Description - Flexible content */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow"
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
            <span>Up to {project.maxTeamSize}</span>
          </motion.div>
        </div>

        {/* Footer - Fixed height */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
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
};

export default ProjectCard;
