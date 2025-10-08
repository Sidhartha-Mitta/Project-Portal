import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";

const API_URL = "http://localhost:5001/api/users";

const useProfileStore = create(() => ({
  // ✅ Save to backend
  saveProfile: async (userId, profileData) => {
    if (!userId) return;

    try {
      // Check if profileData is FormData (for file uploads) or regular object
      const isFormData = profileData instanceof FormData;

      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : {};

      const res = await axios.put(`${API_URL}/${userId}`, profileData, config);
      const updatedUser = res.data.user || res.data;

      // 🔹 Sync with AuthStore
      const { setUser } = useAuthStore.getState();
      setUser(updatedUser);

      console.log("Profile saved ✅", updatedUser);
      return updatedUser;
    } catch (err) {
      console.error("Save failed ❌", err.response?.data || err.message);
      throw err;
    }
  },

  // ✅ Load from backend
  loadProfile: async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      const freshUser = res.data.user || res.data;

      // 🔹 Sync with AuthStore
      const { setUser } = useAuthStore.getState();
      setUser(freshUser);

      console.log("Profile loaded ✅", freshUser);
    } catch (err) {
      console.error("Load failed ❌", err.response?.data || err.message);
    }
  },
}));

export default useProfileStore;
