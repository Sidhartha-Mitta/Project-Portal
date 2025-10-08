import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  XCircleIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
  DocumentIcon,
  VideoCameraIcon as VideoIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useTeamStore } from "../../store/teamStore";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const TeamsPage = () => {
  const {
    teams,
    loading,
    error,
    getTeams,
    messages,
    getMessages,
    sendMessage,
    connectSocket,
    isConnected,
  } = useTeamStore();
  const { user } = useAuthStore();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getTeams();
  }, [getTeams]);

  useEffect(() => {
    // Connect socket on component mount
    if (!isConnected) {
      connectSocket();
    }
  }, [connectSocket, isConnected]);

  useEffect(() => {
    console.log(
      "Initial render - showMobileSidebar:",
      showMobileSidebar,
      "showMobileDetails:",
      showMobileDetails,
      "selectedTeam:",
      selectedTeam
    );
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      const teamId = selectedTeam._id || selectedTeam.id;
      if (teamId) {
        getMessages(teamId);
      }
    }
  }, [selectedTeam, getMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.querySelector(".messages-container");
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

  const handleTeamClick = (team) => {
    console.log("Team clicked:", team);
    console.log("Team _id:", team._id);
    console.log("Team id:", team.id);
    console.log("Current showMobileSidebar:", showMobileSidebar);
    console.log("Current selectedTeam:", selectedTeam);

    if (!team._id && !team.id) {
      console.error("Team has no _id or id field:", team);
      return;
    }

    setSelectedTeam(team);
    setShowMobileSidebar(false);
    console.log(
      "After team selection - showMobileSidebar set to false, selectedTeam set"
    );
  };

  const handleSendMessageClick = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedTeam)
      return;

    try {
      const teamId = selectedTeam._id || selectedTeam.id;
      if (!teamId) return;

      const formData = new FormData();

      if (newMessage.trim()) {
        formData.append("content", newMessage);
      }

      if (selectedFiles.length > 0) {
        // For now, send only the first file. In a full implementation, you'd handle multiple files
        formData.append("file", selectedFiles[0]);
      }

      await sendMessage(teamId, formData);
      setNewMessage("");
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0 || !selectedTeam) return;

    try {
      const teamId = selectedTeam._id || selectedTeam.id;

      // Send files one by one (or you could modify backend to handle multiple files at once)
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        if (newMessage.trim()) {
          formData.append("content", newMessage);
        }

        await sendMessage(teamId, formData);
      }

      setSelectedFiles([]);
      setNewMessage("");
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/"))
      return <PhotoIcon className="h-5 w-5" />;
    if (file.type.startsWith("video/"))
      return <VideoIcon className="h-5 w-5" />;
    return <DocumentIcon className="h-5 w-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = async (messageId, attachmentIndex) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to download files");
      return;
    }

    const teamId = selectedTeam._id || selectedTeam.id;
    const downloadUrl = `http://localhost:5001/api/teams/${teamId}/messages/${messageId}/attachments/${attachmentIndex}/download?token=${token}`;

    try {
      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          return;
        } else if (response.status === 403) {
          toast.error("You do not have permission to download this file.");
          return;
        } else if (response.status === 404) {
          toast.error("File not found.");
          return;
        } else {
          throw new Error(`Download failed: ${response.statusText}`);
        }
      }

      const contentDisposition = response.headers.get("content-disposition");
      let filename = "downloaded-file";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      console.log("File downloaded successfully:", filename);
    } catch (error) {
      console.error("Download error:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else if (error.message.includes("timeout")) {
        toast.error(
          "Download timed out. The file might be too large or there was a network issue."
        );
      } else {
        toast.error(`Download failed: ${error.message}`);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "completed":
        return <TrophyIcon className="h-4 w-4" />;
      case "inactive":
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Error Loading Teams
          </h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={getTeams}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-3xl animate-bounce"></div>
      </div>

      <div className="relative z-10 h-screen flex">
        {/* Mobile Menu Button */}
        <button
          onClick={() => {
            console.log(
              "Mobile menu button clicked, setting showMobileSidebar to true"
            );
            setShowMobileSidebar(true);
          }}
          className="md:hidden fixed top-4 left-4 z-[100] p-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Teams Sidebar - Left Column */}
        <div
          className={`fixed md:static top-16 md:inset-y-0 left-0 z-[60] w-80 sm:w-72 md:w-64 lg:w-80 xl:w-96 bg-white border-r-2 border-gray-200 shadow-xl transform transition-all duration-300 flex flex-col max-h-screen ${
            showMobileSidebar
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Teams</h2>
            </div>
            <p className="text-gray-600 mt-2">Your project teams</p>
          </div>

          {/* Teams List */}
          <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0 scrollbar-hide">
            {teams.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No teams yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Teams will appear here when you join projects
                </p>
              </div>
            ) : (
              <div className="p-2">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    onClick={() => handleTeamClick(team)}
                    className={`p-3 sm:p-4 mb-2 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      selectedTeam?._id === team._id
                        ? "bg-blue-100 border-blue-300 shadow-md"
                        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                          <UsersIcon className="h-6 w-6 text-white" />
                        </div>
                        {team.status === "active" && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-800 font-semibold truncate">
                          {team.name}
                        </h3>
                        <p className="text-gray-500 text-sm truncate">
                          {team.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area - Middle Column */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedTeam ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b-2 border-gray-200 p-3 sm:p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      console.log(
                        "Back button clicked, setting selectedTeam to null and showMobileSidebar to true"
                      );
                      setSelectedTeam(null);
                      setShowMobileSidebar(true);
                    }}
                    className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                    <UsersIcon className="h-5 w-5 text-white" />
                  </div>
                  <button
                    onClick={() => {
                      console.log(
                        "Team name tapped, setting showMobileDetails to true"
                      );
                      setShowMobileDetails(true);
                    }}
                    className="text-left md:hidden"
                  >
                    <h3 className="text-gray-800 font-semibold">
                      {selectedTeam.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {selectedTeam.members?.length || 0} members
                    </p>
                  </button>
                  <div className="hidden md:block">
                    <h3 className="text-gray-800 font-semibold flex items-center gap-2">
                      {selectedTeam.name}
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isConnected ? "bg-green-500" : "bg-red-500"
                        }`}
                        title={isConnected ? "Connected" : "Disconnected"}
                      />
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {selectedTeam.members?.length || 0} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      console.log(
                        "Ellipsis button clicked, setting showMobileDetails to true"
                      );
                      setShowMobileDetails(true);
                    }}
                    className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-container flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50 to-white scrollbar-hide">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                      <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Start the conversation
                    </h3>
                    <p className="text-gray-600">
                      Send a message to begin collaborating with your team
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {Object.entries(groupMessagesByDate(messages))
                      .sort(
                        ([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
                      )
                      .map(([date, dateMessages]) => (
                        <div key={date}>
                          {/* Date Separator */}
                          <div className="flex items-center justify-center my-6">
                            <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                              {formatDate(dateMessages[0].createdAt)}
                            </div>
                          </div>

                          {/* Messages for this date */}
                          {dateMessages.map((message, index) => (
                            <motion.div
                              key={message._id || index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`flex ${
                                message.sender._id === user?._id
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[250px] xs:max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm overflow-hidden ${
                                  message.sender._id === user?._id
                                    ? "bg-blue-600 text-white rounded-br-sm"
                                    : "bg-white text-gray-800 rounded-bl-sm border-2 border-gray-200"
                                }`}
                              >
                                {/* Sender Name (only for received messages) */}
                                {message.sender._id !== user?._id && (
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                                      <span className="text-white font-semibold text-xs">
                                        {(
                                          message.sender.userName ||
                                          message.sender.name ||
                                          "U"
                                        )
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="text-xs font-medium text-blue-600">
                                      {message.sender.userName ||
                                        message.sender.name ||
                                        "Unknown"}
                                    </span>
                                  </div>
                                )}

                                {/* File Attachments */}
                                {message.attachments &&
                                  message.attachments.length > 0 && (
                                    <div className="space-y-2 mb-3">
                                      {message.attachments.map(
                                        (attachment, attachIndex) => (
                                          <div
                                            key={attachIndex}
                                            className={`rounded-lg p-3 border ${
                                              message.sender._id === user?._id
                                                ? "bg-blue-500 border-blue-400"
                                                : "bg-gray-100 border-gray-200"
                                            }`}
                                          >
                                            <div className="flex items-center space-x-3">
                                              <div
                                                className={`flex-shrink-0 ${
                                                  message.sender._id ===
                                                  user?._id
                                                    ? "text-blue-200"
                                                    : "text-blue-600"
                                                }`}
                                              >
                                                {attachment.type === "image" ? (
                                                  <PhotoIcon className="h-5 w-5" />
                                                ) : attachment.type ===
                                                  "video" ? (
                                                  <VideoIcon className="h-5 w-5" />
                                                ) : (
                                                  <DocumentIcon className="h-5 w-5" />
                                                )}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p
                                                  className={`text-sm font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap ${
                                                    message.sender._id ===
                                                    user?._id
                                                      ? "text-white"
                                                      : "text-gray-800"
                                                  }`}
                                                >
                                                  {attachment.filename}
                                                </p>
                                                <p
                                                  className={`text-xs ${
                                                    message.sender._id ===
                                                    user?._id
                                                      ? "text-blue-100"
                                                      : "text-gray-500"
                                                  }`}
                                                >
                                                  {formatFileSize(
                                                    attachment.size
                                                  )}
                                                </p>
                                              </div>
                                              <button
                                                onClick={() =>
                                                  handleDownload(
                                                    message._id,
                                                    attachIndex
                                                  )
                                                }
                                                className={`flex-shrink-0 transition-colors p-1 rounded ${
                                                  message.sender._id ===
                                                  user?._id
                                                    ? "text-blue-200 hover:text-white hover:bg-blue-400"
                                                    : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                }`}
                                              >
                                                <ArrowDownTrayIcon className="h-4 w-4" />
                                              </button>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}

                                {/* Message Content */}
                                {message.content && (
                                  <p className="text-sm leading-relaxed break-words">
                                    {message.content}
                                  </p>
                                )}

                                {/* Timestamp */}
                                <div className="flex items-center justify-end mt-2">
                                  <span
                                    className={`text-xs ${
                                      message.sender._id === user?._id
                                        ? "text-blue-100"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {formatTime(message.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="bg-blue-50 border-t-2 border-blue-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-800 font-semibold">
                      Files to send ({selectedFiles.length})
                    </span>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-100 rounded"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white rounded-lg p-3 border-2 border-blue-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-blue-600">
                            {getFileIcon(file)}
                          </div>
                          <div>
                            <p className="text-blue-800 text-sm font-medium truncate max-w-48 overflow-hidden text-ellipsis whitespace-nowrap">
                              {file.name}
                            </p>
                            <p className="text-blue-600 text-xs">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleFileUpload}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Send Files
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="bg-white border-t-2 border-gray-200 p-3 sm:p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <PaperClipIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        !selectedFiles.length &&
                        handleSendMessageClick()
                      }
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* <button className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <MicrophoneIcon className="h-5 w-5" />
                  </button> */}

                  <button
                    onClick={
                      selectedFiles.length > 0
                        ? handleFileUpload
                        : handleSendMessageClick
                    }
                    disabled={!newMessage.trim() && selectedFiles.length === 0}
                    className={`p-3 rounded-xl transition-colors shadow-sm ${
                      newMessage.trim() || selectedFiles.length > 0
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-3">
                  Select a team
                </h3>
                <p className="text-gray-600 text-lg">
                  Choose a team from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Team Details Sidebar - Right Column */}
        {selectedTeam && (
          <div
            className={`fixed md:static top-16 md:inset-y-0 right-0 z-[60] w-80 sm:w-72 md:w-64 lg:w-80 xl:w-96 bg-white border-l-2 border-gray-200 shadow-xl transform transition-all duration-300 flex flex-col max-h-screen ${
              showMobileDetails
                ? "translate-x-0"
                : "translate-x-full md:translate-x-0"
            }`}
          >
            {/* Details Header */}
            <div className="p-4 sm:p-6 border-b-2 border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      console.log(
                        "Details back button clicked, setting showMobileDetails to false"
                      );
                      setShowMobileDetails(false);
                    }}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                    Team Details
                  </h3>
                </div>
                <button
                  onClick={() => {
                    console.log(
                      "Details sidebar close button clicked, setting showMobileDetails to false"
                    );
                    setShowMobileDetails(false);
                  }}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Team Info */}
            <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0 scrollbar-hide">
              <div className="p-6 space-y-6">
                {/* Team Avatar & Name */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <UsersIcon className="h-10 w-10 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedTeam.name}
                  </h4>
                  <p className="text-gray-600">
                    {selectedTeam.project?.title || "Project Team"}
                  </p>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border-2 border-gray-200 text-center shadow-sm">
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {selectedTeam.members?.length || 0}
                    </div>
                    <div className="text-gray-500 text-sm">Members</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-gray-200 text-center shadow-sm">
                    <div className={`text-2xl font-bold mb-1 text-blue-600`}>
                      {getStatusIcon(selectedTeam.status)}
                    </div>
                    <div className="text-gray-500 text-sm capitalize">
                      {selectedTeam.status}
                    </div>
                  </div>
                </div>

                {/* Members List */}
                <div>
                  <h5 className="text-gray-800 font-semibold mb-4">Members</h5>
                  <div className="space-y-3">
                    {selectedTeam.members?.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 bg-white rounded-lg p-3 border-2 border-gray-200 shadow-sm"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {member.user?.name?.charAt(0) ||
                              member.name?.charAt(0) ||
                              "?"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-800 text-sm font-medium truncate">
                            {member.user?.name || member.name || "Unknown"}
                          </p>
                          <p className="text-gray-500 text-xs truncate">
                            {member.user?.email || member.email || ""}
                          </p>
                          <p className="text-blue-600 text-xs capitalize truncate">
                            {member.role || "member"}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-sm">
                        No members data available
                      </p>
                    )}
                  </div>
                </div>

                {/* Media Section */}
                <div>
                  <h5 className="text-gray-800 font-semibold mb-4">
                    Media & Files
                  </h5>
                  {messages && messages.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                      {
                        messages
                          .filter(
                            (message) =>
                              message.attachments &&
                              message.attachments.length > 0
                          )
                          .flatMap((message) =>
                            message.attachments.map(
                              (attachment, attachIndex) => (
                                <div
                                  key={`${message._id}-${attachIndex}`}
                                  className="bg-white rounded-lg p-3 border-2 border-gray-200 shadow-sm"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="text-blue-600">
                                      {attachment.type === "image" ? (
                                        <PhotoIcon className="h-5 w-5" />
                                      ) : attachment.type === "video" ? (
                                        <VideoIcon className="h-5 w-5" />
                                      ) : (
                                        <DocumentIcon className="h-5 w-5" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className="text-gray-800 text-sm font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap"
                                        title={attachment.filename}
                                      >
                                        {attachment.filename}
                                      </p>
                                      <p className="text-gray-500 text-xs truncate">
                                        {formatFileSize(attachment.size)} •{" "}
                                        {formatTime(message.createdAt)}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleDownload(message._id, attachIndex)
                                      }
                                      className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
                                    >
                                      <ArrowDownTrayIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              )
                            )
                          )
                          .slice(0, 10) // Limit to 10 most recent files
                      }
                      {messages.filter(
                        (message) =>
                          message.attachments && message.attachments.length > 0
                      ).length === 0 && (
                        <div className="text-center py-8 bg-white rounded-xl border-2 border-gray-200 border-dashed">
                          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">
                            No media shared yet
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Shared files will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white rounded-xl border-2 border-gray-200 border-dashed">
                      <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        No media shared yet
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Shared files will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
