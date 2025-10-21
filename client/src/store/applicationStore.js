import { create } from "zustand";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const useApplicationStore = create((set) => ({
  // State
  myApplications: [],
  projectApplications: [],
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Apply to project
  applyToProject: async (projectId, applicationData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      Object.entries(applicationData).forEach(([key, value]) => {
        if (key === 'resumeFile' && value) {
          formData.append('resume', value);
        } else if (key === 'skills' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/projects/${projectId}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to apply to project");
      }

      // Add new application to myApplications
      set((state) => ({
        myApplications: [result.application, ...state.myApplications],
        loading: false,
      }));

      return result.application;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get my applications
  getMyApplications: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/applications/my-applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch my applications");
      }

      set({
        myApplications: result.applications || result,
        loading: false,
      });

      return result.applications || result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get project applications
  getProjectApplications: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/projects/${projectId}/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch project applications");
      }

      set({
        projectApplications: result.applications || result,
        loading: false,
      });

      return result.applications || result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update application status
  updateApplicationStatus: async (projectId, applicationId, status) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/projects/${projectId}/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update application status");
      }

      // Update application in both arrays and refresh project applications
      set((state) => ({
        myApplications: state.myApplications.map((app) =>
          app._id === applicationId ? result.application : app
        ),
        projectApplications: state.projectApplications.map((app) =>
          app._id === applicationId ? result.application : app
        ),
        loading: false,
      }));

      // Refresh the project applications to ensure consistency
      try {
        const refreshResponse = await fetch(`${API_URL}/projects/${projectId}/applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json();
          set({
            projectApplications: refreshResult.applications || refreshResult,
          });
        }
      } catch (refreshError) {
        console.warn("Failed to refresh applications:", refreshError);
      }

      return result.application;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Clear project applications
  clearProjectApplications: () => set({ projectApplications: [] }),

  // Reset store
  reset: () => set({
    myApplications: [],
    projectApplications: [],
    loading: false,
    error: null,
  }),
}));