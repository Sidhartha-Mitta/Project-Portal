import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../../store/projectStore";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const PostNewProject = () => {
  const navigate = useNavigate();
  const { createProject, loading, error } = useProjectStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    skillsRequired: [],
    difficulty: "",
    tags: [],
    duration: "",
    maxTeamSize: "",
    priority: "medium",
    deadline: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Category options based on the Project model
  const categories = [
    { value: "web-development", label: "Web Development" },
    { value: "mobile-app", label: "Mobile App" },
    { value: "data-science", label: "Data Science" },
    { value: "ai-ml", label: "AI/ML" },
    { value: "iot", label: "IoT" },
    { value: "blockchain", label: "Blockchain" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "game-development", label: "Game Development" },
    { value: "ui-ux", label: "UI/UX" },
  ];

  const difficulties = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSkill = () => {
    if (
      skillInput.trim() &&
      !formData.skillsRequired.includes(skillInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to post a project");
      navigate("/login");
      return;
    }

    try {
      const projectData = {
        ...formData,
        duration: parseInt(formData.duration),
        maxTeamSize: parseInt(formData.maxTeamSize),
        deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : null,
      };

      await createProject(projectData);
      toast.success("Project created successfully!");
      navigate("/dashboard"); // or wherever you want to redirect
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-300 mb-6">
            Please login to post a new project
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 backdrop-blur-sm shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          <div className="px-6 py-6 border-b border-white/20 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
            <h1 className="text-3xl font-bold text-white mb-2">
              Post New Project
            </h1>
            <p className="text-gray-300">
              Create a new project and find talented developers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-200 mb-3"
              >
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={100}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter project title"
              />
            </div>

            {/* Description */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-200 mb-3"
              >
                Project Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                maxLength={2000}
                rows={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm resize-none"
                placeholder="Describe your project in detail..."
              />
              <p className="text-sm text-gray-400 mt-2">
                {formData.description.length}/2000 characters
              </p>
            </div>

            {/* Category and Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-200 mb-3"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800 text-gray-300">
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat.value}
                      value={cat.value}
                      className="bg-gray-800 text-white"
                    >
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                <label
                  htmlFor="difficulty"
                  className="block text-sm font-medium text-gray-200 mb-3"
                >
                  Difficulty Level *
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800 text-gray-300">
                    Select difficulty
                  </option>
                  {difficulties.map((diff) => (
                    <option
                      key={diff.value}
                      value={diff.value}
                      className="bg-gray-800 text-white"
                    >
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration and Team Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-200 mb-3"
                >
                  Duration (in weeks) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="e.g., 12"
                />
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                <label
                  htmlFor="maxTeamSize"
                  className="block text-sm font-medium text-gray-200 mb-3"
                >
                  Maximum Team Size *
                </label>
                <input
                  type="number"
                  id="maxTeamSize"
                  name="maxTeamSize"
                  value={formData.maxTeamSize}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="e.g., 5"
                />
              </div>
            </div>

            {/* Priority and Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-200 mb-3"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                >
                  {priorities.map((priority) => (
                    <option
                      key={priority.value}
                      value={priority.value}
                      className="bg-gray-800 text-white"
                    >
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-200 mb-3"
                >
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Skills Required */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Skills Required
              </label>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSkill())
                  }
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="Add a skill (e.g., React, Node.js)"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 backdrop-blur-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skillsRequired.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-blue-500/20 text-blue-200 border border-blue-400/30 backdrop-blur-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-300 hover:text-blue-100 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Tags
              </label>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 backdrop-blur-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-green-500/20 text-green-200 border border-green-400/30 backdrop-blur-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-green-300 hover:text-green-100 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-white/20">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 border border-white/30 text-gray-300 rounded-lg hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm shadow-lg"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostNewProject;
