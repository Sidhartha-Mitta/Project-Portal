import { create } from "zustand";

const getStoredTheme = () => {
  return localStorage.getItem("theme") || "light";
};

export const useThemeStore = create((set) => ({
  theme: getStoredTheme(),
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return { theme: newTheme };
    }),
}));