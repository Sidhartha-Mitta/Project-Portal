import UserLayout from "./assets/layouts/UserLayout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";
import Home from "./assets/Pages/Home";
import Register from "./assets/Pages/Auth/Register";
import Login from "./assets/Pages/Auth/Login";
import ProfilePage from "./assets/Pages/ProfilePage";
import Dashboard from "./assets/Pages/Dashboard";
import StudentDashboard from "./assets/Pages/StudentDashboard";
import IndustryDashboard from "./assets/Pages/IndustryDashboard";
import ProjectsPage from "./assets/Pages/ProjectPage";
import ProjectDelails from "./assets/Common/ProjectDelails";
import ProjectApplicants from "./assets/Pages/ProjectApplicants"
import PostNewProject from "./assets/Pages/PostNewProject";
import TeamsPage from "./assets/Pages/TeamsPage";
// import Project from "./assets/Common/demo";
function App() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const router = createBrowserRouter([
    {
      path: "/",
      element: <UserLayout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/profile",
          element: <ProfilePage />,
        },
        {
          path: "/projects",
          element: <ProjectsPage />,
        },
        {
          path: "/projects/:id",
          element: <ProjectDelails />,
        },
        {
          path: "/projects/:id/applicants",
          element: <ProjectApplicants />,
        },
        {
          path: "/dashboard",
          element: user?.role === 'student' ? <StudentDashboard /> : user?.role === 'industry' ? <IndustryDashboard /> : <Dashboard />,
        },
        {
          path: "/post-project",
          element: <PostNewProject />,
        },
        {
          path: "/teams",
          element: <TeamsPage />,
        },
      ],
    },
  ]);
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === "dark" ? "#1f2937" : "#ffffff",
            color: theme === "dark" ? "#f9fafb" : "#1f2937",
            border: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: theme === "dark" ? "#f9fafb" : "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: theme === "dark" ? "#f9fafb" : "#ffffff",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
