import React from "react";

export default function ProfileAvatar({ name = "" }) {
  const safeName = name?.trim() || "User";

  const initials = safeName
    .split(" ")
    .filter(Boolean) 
    .map((n) => n[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);

  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  const colorIndex =
    safeName.charCodeAt(0) % colors.length;

  return (
    <div
      className={`w-10 h-10 ${colors[colorIndex]} text-white flex items-center justify-center rounded-full font-bold`}
    >
      {initials || "?"}
    </div>
  );
}
// After viewing the details of the project the student can able to register the project and in that registration form it should ask the basic details and upload resume and submit. In project details one option should be enable for the industry that is view Applicants. After register the industry/client can able to watch the applicants details by clicking that view applicants button. Such that he can view the profile of the applicant and the uploaded resume 