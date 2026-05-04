import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";

const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/users`;

const getUserId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value._id || value.id || null;
};

const useProfileStore = create(() => ({
  // ✅ Save to backend
  saveProfile: async (userId, profileData) => {
    const id = getUserId(userId);
    if (!id) throw new Error("Cannot save profile without a user id");

    try {
      // Check if profileData is FormData (for file uploads) or regular object
      const isFormData = profileData instanceof FormData;

      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : {};

      const res = await axios.put(`${API_URL}/${id}`, profileData, config);
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
      const userId = getUserId(id);
      if (!userId) throw new Error("Cannot load profile without a user id");

      const res = await axios.get(`${API_URL}/${userId}`);
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
