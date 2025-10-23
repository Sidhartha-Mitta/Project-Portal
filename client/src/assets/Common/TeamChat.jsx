import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  PhoneIcon,
  VideoCameraIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { useTeamStore } from '../../store/teamStore';
import { useThemeStore } from '../../store/themeStore';
import toast from 'react-hot-toast';

const TeamChat = ({ team, isOpen, onClose }) => {
  const {
    messages,
    getMessages,
    handleSendMessage: handleSendMessageFromStore,
    addReaction,
    connectSocket,
    isConnected,
    typingUsers,
  } = useTeamStore();

  const { theme, toggleTheme } = useThemeStore();

  const themeStyles = {
    light: {
      modalBg: 'bg-white',
      chatContainer: 'bg-gray-100',
      headerBg: 'bg-gray-200',
      headerBorder: 'border-gray-300',
      messagesBg: 'bg-gray-50',
      inputBg: 'bg-white',
      inputBorder: 'border-gray-300',
      textPrimary: 'text-black',
      textSecondary: 'text-gray-600',
      textAccent: 'text-blue-600',
      buttonHover: 'hover:bg-gray-300',
      messageOwn: 'bg-blue-500 text-white',
      messageOther: 'bg-white text-black border border-gray-200',
      mentionBg: 'bg-blue-100 text-blue-800',
      reactionBg: 'bg-gray-200 hover:bg-gray-300',
      dropdownBg: 'bg-white border border-gray-300',
      fileBg: 'bg-gray-100',
    },
    dark: {
      modalBg: 'bg-black/50',
      chatContainer: 'bg-[#111b21]',
      headerBg: 'bg-[#202c33]',
      headerBorder: 'border-[#2a3942]',
      messagesBg: 'bg-[#0a0a0a]',
      inputBg: 'bg-[#2a3942]',
      inputBorder: 'border-[#2a3942]',
      textPrimary: 'text-white',
      textSecondary: 'text-[#8696a0]',
      textAccent: 'text-[#00a884]',
      buttonHover: 'hover:bg-[#2a3942]',
      messageOwn: 'bg-[#00a884] text-white',
      messageOther: 'bg-[#202c33] text-white',
      mentionBg: 'bg-[#00a884]/20 text-[#00a884]',
      reactionBg: 'bg-[#2a3942] hover:bg-[#3a4952]',
      dropdownBg: 'bg-[#2a3942]',
      fileBg: 'bg-[#2a3942]',
    },
  };

  const currentTheme = themeStyles[theme];

  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionStart, setMentionStart] = useState(-1);
  const [showReactions, setShowReactions] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (isOpen && team) {
      console.log('Opening chat for team:', team._id || team.id);
      // Check if socket is already connected
      const { isConnected } = useTeamStore.getState();
      if (!isConnected) {
        connectSocket();
      }
      const teamId = team._id || team.id;
      if (teamId) {
        getMessages(teamId);
      }
    } else if (!isOpen) {
      console.log('Closing chat');
      // Don't disconnect socket, just leave the room
      const teamId = team?._id || team?.id;
      if (teamId) {
        const { leaveTeam } = useTeamStore.getState();
        leaveTeam(teamId);
      }
    }

    // Don't disconnect on unmount - keep socket alive
  }, [isOpen, team, getMessages, connectSocket, isConnected]);

  useLayoutEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold
      setShouldAutoScroll(isNearBottom);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    try {
      const teamId = team._id || team.id;
      if (!teamId) return;

      let messageData;

      if (selectedFile) {
        const formData = new FormData();
        if (newMessage.trim()) formData.append('content', newMessage.trim());
        formData.append('file', selectedFile);
        formData.append(
          'messageType',
          selectedFile.type.startsWith('image/')
            ? 'image'
            : selectedFile.type.startsWith('video/')
            ? 'video'
            : 'file'
        );
        messageData = formData;
      } else {
        messageData = { content: newMessage.trim(), messageType: 'text' };
      }

      await handleSendMessageFromStore(teamId, messageData);
      setNewMessage('');
      clearSelectedFile();
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Handle mentions
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1 && (atIndex === 0 || textBeforeCursor[atIndex - 1] === ' ')) {
      const query = textBeforeCursor.substring(atIndex + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setMentionStart(atIndex);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }

    if (!isTyping && value.trim()) {
      setIsTyping(true);
      const teamId = team._id || team.id;
      if (teamId) {
        const { startTyping } = useTeamStore.getState();
        startTyping(teamId);
      }
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const teamId = team._id || team.id;
      if (teamId) {
        const { stopTyping } = useTeamStore.getState();
        stopTyping(teamId);
      }
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape' && showMentions) {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (user) => {
    const beforeMention = newMessage.substring(0, mentionStart);
    const afterMention = newMessage.substring(mentionStart + mentionQuery.length + 1);
    const mentionText = `@${user.userName || user.name} `;
    const newText = beforeMention + mentionText + afterMention;

    setNewMessage(newText);
    setShowMentions(false);
    setMentionQuery('');
    setMentionStart(-1);
  };

  const handleReactionClick = async (messageId, emoji) => {
    try {
      await addReaction(teamId, messageId, emoji);
      setShowReactions(null);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const toggleReactions = (messageId) => {
    setShowReactions(showReactions === messageId ? null : messageId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/avi', 'video/mov',
        'audio/mp3', 'audio/wav', 'audio/m4a',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/csv'
      ];

      if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
        toast.error('Unsupported file type. Please select an image, video, audio, or document file.');
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast.error('File size too large. Maximum allowed size is 10MB.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = async (messageId, attachmentIndex) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to download files');
      return;
    }

    const teamId = team._id || team.id;
    const downloadUrl = `http://localhost:5001/api/teams/${teamId}/messages/${messageId}/attachments/${attachmentIndex}/download?token=${token}`;

    try {
      // Show download progress for large files
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          return;
        } else if (response.status === 403) {
          toast.error('You do not have permission to download this file.');
          return;
        } else if (response.status === 404) {
          toast.error('File not found.');
          return;
        } else {
          throw new Error(`Download failed: ${response.statusText}`);
        }
      }

      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'downloaded-file';

      // Extract filename from content-disposition header
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      console.log('File downloaded successfully:', filename);
    } catch (error) {
      console.error('Download error:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.message.includes('timeout')) {
        toast.error('Download timed out. The file might be too large or there was a network issue.');
      } else {
        toast.error(`Download failed: ${error.message}`);
      }
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageWithMentions = (content) => {
    if (!content) return null;

    // Simple regex to find @mentions
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Add highlighted mention
      const mentionText = match[0];
      parts.push(
        <span key={match.index} className={`${currentTheme.mentionBg} px-1 py-0.5 rounded font-medium`}>
          {mentionText}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  if (!isOpen || !team) return null;

  const teamId = team._id || team.id;
  if (!teamId) return null;

  // Filter team members for mentions
  const filteredMembers = team.members?.filter(member =>
    member.status === 'active' &&
    member.user &&
    (member.user.userName || member.user.name).toLowerCase().includes(mentionQuery.toLowerCase())
  ) || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 ${theme === 'light' ? 'bg-black/30' : 'bg-black/50'} backdrop-blur-sm flex items-center justify-center p-4 z-50`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`${currentTheme.chatContainer} rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-[500px] sm:h-[600px] md:h-[650px] lg:h-[700px] flex flex-col overflow-hidden shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Chat Header */}
          <div className={`${currentTheme.headerBg} px-4 py-3 flex items-center justify-between border-b ${currentTheme.headerBorder}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {team.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className={`${currentTheme.textPrimary} font-medium text-sm flex items-center gap-2`}>
                  {team.name}
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                </h3>
                <p className={`${currentTheme.textSecondary} text-xs`}>
                  {team.members?.length || 0} members
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button className={`p-2 ${currentTheme.textSecondary} hover:text-white rounded-full ${currentTheme.buttonHover}`}>
                <PhoneIcon className="h-5 w-5" />
              </motion.button>
              <motion.button className={`p-2 ${currentTheme.textSecondary} hover:text-white rounded-full ${currentTheme.buttonHover}`}>
                <VideoCameraIcon className="h-5 w-5" />
              </motion.button>
              <motion.button
                onClick={toggleTheme}
                className={`p-2 ${currentTheme.textSecondary} hover:text-white rounded-full ${currentTheme.buttonHover}`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
              </motion.button>
              <motion.button
                onClick={onClose}
                className={`p-2 ${currentTheme.textSecondary} hover:text-white rounded-full ${currentTheme.buttonHover}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className={`flex-1 overflow-y-auto p-4 space-y-4 ${currentTheme.messagesBg}`}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <PaperAirplaneIcon className={`h-8 w-8 ${currentTheme.textAccent}`} />
                <h3 className={`${currentTheme.textPrimary} font-medium mb-2`}>
                  Start the conversation
                </h3>
              </div>
            ) : (
              <AnimatePresence>
                {messages
                  .slice()
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map((message, index) => (
                    <motion.div
                      key={message._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex group ${
                        message.sender._id === localStorage.getItem('userId')
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`relative max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender._id === localStorage.getItem('userId')
                            ? `${currentTheme.messageOwn} rounded-br-sm`
                            : `${currentTheme.messageOther} rounded-bl-sm`
                        }`}
                      >
                        {/* ✅ Sender name */}
                        {message.sender._id !==
                          localStorage.getItem('userId') && (
                          <p className={`text-xs font-medium ${currentTheme.textAccent} mb-1`}>
                            {message.sender.userName ||
                              message.sender.name ||
                              'Unknown'}
                          </p>
                        )}

                        {/* Attachments */}
                        {message.attachments?.length > 0 && (
                          <div className="mb-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="mb-2">
                                {attachment.type === 'image' ? (
                                  <div className="relative group">
                                    <img
                                      src={attachment.url}
                                      alt={attachment.filename}
                                      className="max-w-full h-auto rounded-lg"
                                      style={{ maxHeight: '200px' }}
                                    />
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log('🖱️ Download button clicked for:', {
                                            messageId: message._id,
                                            attachmentIndex: index,
                                            filename: attachment.filename,
                                            url: attachment.url
                                          });
                                          handleDownload(
                                            message._id,
                                            index
                                          );
                                        }}
                                        className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                                        title={`Download ${attachment.filename}`}
                                      >
                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                      </motion.button>
                                    </div>
                                  </div>
                                ) : attachment.type === 'video' ? (
                                  <div className="relative group">
                                    <video
                                      controls
                                      className="max-w-full h-auto rounded-lg"
                                      style={{ maxHeight: '200px' }}
                                    >
                                      <source src={attachment.url} type="video/mp4" />
                                    </video>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log('🖱️ Video download button clicked for:', {
                                            messageId: message._id,
                                            attachmentIndex: index,
                                            filename: attachment.filename,
                                            url: attachment.url
                                          });
                                          handleDownload(
                                            message._id,
                                            index
                                          );
                                        }}
                                        className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                                        title={`Download ${attachment.filename}`}
                                      >
                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                      </motion.button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2 p-3 bg-black/20 rounded-lg">
                                    <PaperClipIcon className="h-5 w-5" />
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className="text-sm truncate"
                                        title={attachment.filename}
                                      >
                                        {attachment.filename}
                                      </p>
                                    </div>
                                    <motion.button
                                      onClick={() => {
                                        console.log('🖱️ Document download button clicked for:', {
                                          messageId: message._id,
                                          attachmentIndex: index,
                                          filename: attachment.filename,
                                          url: attachment.url
                                        });
                                        handleDownload(
                                          message._id,
                                          index
                                        );
                                      }}
                                      className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                      title={`Download ${attachment.filename}`}
                                    >
                                      <ArrowDownTrayIcon className="h-4 w-4" />
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Message */}
                        {message.content && (
                          <p className="text-sm">
                            {renderMessageWithMentions(message.content)}
                          </p>
                        )}

                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(
                              message.reactions.reduce((acc, reaction) => {
                                if (!acc[reaction.emoji]) {
                                  acc[reaction.emoji] = { emoji: reaction.emoji, count: 0, users: [] };
                                }
                                acc[reaction.emoji].count++;
                                acc[reaction.emoji].users.push(reaction.user);
                                return acc;
                              }, {})
                            ).map(([emoji, data]) => (
                              <button
                                key={emoji}
                                onClick={() => handleReactionClick(message._id, emoji)}
                                className={`text-xs ${currentTheme.reactionBg} px-2 py-1 rounded-full flex items-center gap-1 transition-colors`}
                              >
                                <span>{emoji}</span>
                                <span className="text-[#8696a0]">{data.count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Time + status + reaction button */}
                        <div
                          className={`flex items-center justify-between mt-1 ${
                            message.sender._id ===
                            localStorage.getItem('userId')
                              ? theme === 'light' ? 'text-gray-600' : 'text-white/70'
                              : currentTheme.textSecondary
                          }`}
                        >
                          <span className="text-xs">
                            {formatTime(message.createdAt)}
                          </span>
                          <div className="flex items-center space-x-1">
                            <motion.button
                              onClick={() => toggleReactions(message._id)}
                              className="p-1 text-xs hover:bg-[#2a3942] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              😀
                            </motion.button>
                            {message.sender._id ===
                              localStorage.getItem('userId') && (
                              <CheckIcon className="h-3 w-3" />
                            )}
                          </div>
                        </div>

                        {/* Reaction picker */}
                        {showReactions === message._id && (
                          <div className={`absolute bottom-full right-0 ${currentTheme.dropdownBg} rounded-lg p-2 shadow-lg z-10`}>
                            <div className="flex gap-1">
                              {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReactionClick(message._id, emoji)}
                                  className="p-2 hover:bg-[#3a4952] rounded text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing */}
          {typingUsers.length > 0 && (
            <div className={`px-4 py-2 ${currentTheme.textSecondary} text-sm`}>
              {typingUsers.length === 1
                ? `${typingUsers[0].userName} is typing...`
                : `${typingUsers.length} people are typing...`}
            </div>
          )}

          {/* Input */}
          <div className={`${currentTheme.headerBg} px-4 py-3 border-t ${currentTheme.headerBorder}`}>
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleFileUploadClick}
                className={`p-2 ${currentTheme.textSecondary} hover:text-white rounded-full ${currentTheme.buttonHover}`}
              >
                <PaperClipIcon className="h-5 w-5" />
              </motion.button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className={`w-full px-4 py-2 ${currentTheme.inputBg} ${currentTheme.textPrimary} rounded-full`}
                />
                {/* Mentions Dropdown */}
                {showMentions && filteredMembers.length > 0 && (
                  <div className={`absolute bottom-full left-0 right-0 ${currentTheme.dropdownBg} rounded-lg shadow-lg max-h-48 overflow-y-auto z-10`}>
                    {filteredMembers.slice(0, 5).map((member) => (
                      <button
                        key={member.user._id}
                        onClick={() => handleMentionSelect(member.user)}
                        className={`w-full px-4 py-2 text-left ${currentTheme.buttonHover} ${currentTheme.textPrimary} flex items-center space-x-3`}
                      >
                        <div className="w-8 h-8 bg-[#00a884] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(member.user.userName || member.user.name).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.user.userName || member.user.name}</p>
                          <p className={`text-xs ${currentTheme.textSecondary}`}>{member.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <motion.button className={`p-2 ${currentTheme.textSecondary} hover:text-white rounded-full ${currentTheme.buttonHover}`}>
                <MicrophoneIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() && !selectedFile}
                className={`p-2 rounded-full ${
                  newMessage.trim() || selectedFile
                    ? 'bg-[#00a884] text-white'
                    : 'bg-[#2a3942] text-[#8696a0]'
                }`}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </motion.button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />

            {selectedFile && (
              <div className={`px-4 py-2 ${currentTheme.fileBg} rounded-lg mx-4 mb-2 flex items-center justify-between`}>
                <div className="flex items-center space-x-2">
                  <PaperClipIcon className={`h-4 w-4 ${currentTheme.textSecondary}`} />
                  <span className={`${currentTheme.textPrimary} text-sm truncate max-w-48`}>
                    {selectedFile.name}
                  </span>
                  <span className={`${currentTheme.textSecondary} text-xs`}>
                    ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                <motion.button
                  onClick={clearSelectedFile}
                  className={`p-1 ${currentTheme.textSecondary} hover:text-white rounded-full ${currentTheme.buttonHover}`}
                >
                  <XMarkIcon className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamChat;
