import { create } from "zustand";
import { io } from "socket.io-client";

const API_URL = "http://localhost:5001/api/teams";
const SOCKET_URL = "http://localhost:5001";

export const useTeamStore = create((set, get) => ({
  // State
  teams: [],
  currentTeam: null,
  messages: [],
  loading: false,
  error: null,
  socket: null,
  isConnected: false,
  typingUsers: [],

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Socket.IO actions
  connectSocket: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for socket connection');
      return;
    }

    // Disconnect existing socket if any
    const { socket: existingSocket } = get();
    if (existingSocket) {
      existingSocket.disconnect();
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      set({ socket, isConnected: true });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      set({ error: error.message, isConnected: false });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    socket.on('new-message', (data) => {
      console.log('Received new message via socket:', data.message.content || 'file');
      set((state) => ({
        messages: [...state.messages, data.message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      }));
    });

    socket.on('user-typing', (data) => {
      set((state) => ({
        typingUsers: [...state.typingUsers.filter(u => u.userId !== data.userId), data]
      }));
    });

    socket.on('user-stop-typing', (data) => {
      set((state) => ({
        typingUsers: state.typingUsers.filter(u => u.userId !== data.userId)
      }));
    });

    socket.on('joined-team', (data) => {
      console.log('Successfully joined team:', data.teamId);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      set({ error: error });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      console.log('Disconnecting socket');
      socket.disconnect();
      set({ socket: null, isConnected: false, typingUsers: [] });
    }
  },

  joinTeam: (teamId) => {
    const { socket } = get();
    if (!socket) {
      console.log('No socket available for joining team');
      return;
    }

    const attemptJoin = () => {
      if (socket.connected) {
        console.log('Joining team:', teamId);
        socket.emit('join-team', teamId);
      } else {
        console.log('Socket not connected, waiting for connection...');
        socket.once('connect', () => {
          console.log('Socket connected, now joining team:', teamId);
          socket.emit('join-team', teamId);
        });
      }
    };

    attemptJoin();
  },

  leaveTeam: (teamId) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      console.log('Leaving team:', teamId);
      socket.emit('leave-team', teamId);
    }
  },

  startTyping: (teamId) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('typing', { teamId });
    }
  },

  stopTyping: (teamId) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('stop-typing', { teamId });
    }
  },

  // Get user's teams
  getTeams: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch teams");
      }

      set({
        teams: result.teams || result,
        loading: false,
      });

      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get team by ID
  getTeamById: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch team");
      }

      set({
        currentTeam: result.team || result,
        loading: false,
      });

      return result.team || result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get team messages
  getMessages: async (teamId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      console.log('Client: Fetching messages for team:', teamId);

      const response = await fetch(`${API_URL}/${teamId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      const result = await response.json();

      console.log('Client: Get messages response:', {
        ok: response.ok,
        status: response.status,
        messageCount: result.messages ? result.messages.length : 0,
        messagesWithAttachments: result.messages ? result.messages.filter(msg => msg.attachments && msg.attachments.length > 0).length : 0
      });

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch messages");
      }

      // Sort messages chronologically (oldest first)
      const sortedMessages = (result.messages || result).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      set({
        messages: sortedMessages,
        loading: false,
      });

      // Join the team room for real-time updates
      get().joinTeam(teamId);

      return sortedMessages;
    } catch (error) {
      console.error('Client: Get messages error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Add reaction to message
  addReaction: async (teamId, messageId, emoji) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/${teamId}/messages/${messageId}/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ emoji }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add reaction");
      }

      // Update the message in local state
      set((state) => ({
        messages: state.messages.map(msg =>
          msg._id === messageId
            ? { ...msg, reactions: result.reactions }
            : msg
        ),
        loading: false,
      }));

      return result;
    } catch (error) {
      console.error('Add reaction error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Send message
  sendMessage: async (teamId, messageData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Check if messageData is FormData (for file uploads) or regular object
      const isFormData = messageData instanceof FormData;
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      console.log('Client: Sending message:', {
        teamId,
        isFormData,
        messageData: isFormData ? 'FormData with files' : messageData,
        hasFiles: isFormData && messageData.has('file')
      });

      // Don't set Content-Type for FormData, let browser set it with boundary
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
        messageData = JSON.stringify(messageData);
      }

      const response = await fetch(`${API_URL}/${teamId}/messages`, {
        method: "POST",
        headers,
        credentials: 'include',
        body: messageData,
      });
      const result = await response.json();

      console.log('Client: Send message response:', {
        ok: response.ok,
        status: response.status,
        result
      });

      if (!response.ok) {
        throw new Error(result.message || "Failed to send message");
      }

      // Don't add message to local state - it will be received via Socket.IO
      set({ loading: false });

      return result.data;
    } catch (error) {
      console.error('Client: Send message error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Clear current team
  clearCurrentTeam: () => set({ currentTeam: null }),

  // Clear messages
  clearMessages: () => set({ messages: [] }),

  // Reset store
  reset: () => set({
    teams: [],
    currentTeam: null,
    messages: [],
    loading: false,
    error: null,
  }),
}));