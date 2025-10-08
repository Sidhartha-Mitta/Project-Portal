import { create } from "zustand";

const API_URL = "http://localhost:5001/api/projects";

export const useProjectStore = create((set) => ({
  // State
  projects: [],
  currentProject: null,
  myProjects: [],
  dashboardData: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProjects: 0,
    hasNext: false,
    hasPrev: false
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Create new project
  createProject: async (projectData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(projectData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to create project");
      }

      // Add new project to the beginning of projects array
      set((state) => ({
        projects: [result.project, ...state.projects],
        myProjects: [result.project, ...state.myProjects],
        loading: false,
      }));

      return result.project;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get all projects with filters
  getAllProjects: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}?${queryParams}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch projects");
      }

      set({
        projects: result.projects,
        pagination: result.pagination,
        loading: false,
      });

      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get projects for current session (industry sees only their projects, students see all)
  getSessionProjects: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/session?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch session projects");
      }

      set({
        projects: result.projects,
        pagination: result.pagination,
        loading: false,
      });

      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get single project by ID
  getProjectById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch project");
      }

      set({
        currentProject: result.project,
        loading: false,
      });

      return result.project;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get user's projects
  getMyProjects: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/user/my-projects?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch your projects");
      }

      set({
        myProjects: result.projects,
        pagination: result.pagination,
        loading: false,
      });

      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update project
  updateProject: async (id, updateData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update project");
      }

      // Update project in both arrays
      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === id ? result.project : p
        ),
        myProjects: state.myProjects.map((p) =>
          p._id === id ? result.project : p
        ),
        currentProject: state.currentProject?._id === id ? result.project : state.currentProject,
        loading: false,
      }));

      return result.project;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete project");
      }

      // Remove project from both arrays
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== id),
        myProjects: state.myProjects.filter((p) => p._id !== id),
        currentProject: state.currentProject?._id === id ? null : state.currentProject,
        loading: false,
      }));

      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update submission status
  updateSubmissionStatus: async (projectId, submissionId, status, feedback) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/${projectId}/submissions/${submissionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status, feedback }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update submission status");
      }

      // Refresh dashboard data
      const dashboardResponse = await fetch(`${API_URL}/dashboard/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json();
        set({ dashboardData: dashboardResult.data });
      }

      set({ loading: false });
      return result.project;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Rate project
  rateProject: async (projectId, ratingData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/${projectId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(ratingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to rate project");
      }

      // Refresh dashboard data
      const dashboardResponse = await fetch(`${API_URL}/dashboard/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json();
        set({ dashboardData: dashboardResult.data });
      }

      set({ loading: false });
      return result.project;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Submit project
  submitProject: async (projectId, submissionData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      Object.entries(submissionData).forEach(([key, value]) => {
        if (key === 'zipFile' && value) {
          formData.append('zipFile', value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/${projectId}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit project");
      }

      // Update dashboard data
      const dashboardResponse = await fetch(`${API_URL}/dashboard/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json();
        set({ dashboardData: dashboardResult.data });
      }

      set({ loading: false });
      return result.project;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get dashboard data
  getDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/dashboard/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }

      set({
        dashboardData: result.data,
        loading: false,
      });

      return result.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Clear current project
  clearCurrentProject: () => set({ currentProject: null }),

  // Reset store
  reset: () => set({
    projects: [],
    currentProject: null,
    myProjects: [],
    dashboardData: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalProjects: 0,
      hasNext: false,
      hasPrev: false
    }
  }),
}));