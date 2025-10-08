// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { useAuthStore } from "../../store/authStore";
// import useProfileStore from "../../store/useProfileStore";

// import {
//   UserCircleIcon,
//   PencilIcon,
//   EnvelopeIcon,
//   LinkIcon,
//   AcademicCapIcon,
//   BriefcaseIcon,
//   StarIcon,
// } from "@heroicons/react/24/outline";

// const fadeIn = {
//   hidden: { opacity: 0, y: 20 },
//   visible: (i = 1) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.15 },
//   }),
// };

// const ProfilePage = () => {
//   motion;
//   const { user, setUser } = useAuthStore();
//   const { saveProfile, loadProfile } = useProfileStore();

//   const [isEditing, setIsEditing] = useState(false);

//   const [editData, setEditData] = useState(() => ({
//     ...user,
//     profile: { ...user.profile },
//   }));

//   // Save updated profile
//   const handleSave = async () => {
//     console.log("Saving profile...", editData);

//     // Update auth store immediately for instant UI changes
//     setUser(editData);

//     // Save to backend
//     await saveProfile(editData);

//     setIsEditing(false);

//     // Reload fresh copy from backend
//     await loadProfile(editData._id);
//   };

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setEditData({ ...editData, avatar: imageUrl });
//     }
//   };

//   const addSkill = (skill) => {
//     if (skill && !editData.profile.skills.includes(skill)) {
//       setEditData({
//         ...editData,
//         profile: {
//           ...editData.profile,
//           skills: [...editData.profile.skills, skill],
//         },
//       });
//     }
//   };

//   const removeSkill = (skill) => {
//     setEditData({
//       ...editData,
//       profile: {
//         ...editData.profile,
//         skills: editData.profile.skills.filter((s) => s !== skill),
//       },
//     });
//   };

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-gray-600">No user data found. Please log in.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 py-10">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
//           {/* Sidebar */}
//           <motion.div
//             variants={fadeIn}
//             initial="hidden"
//             animate="visible"
//             transition={{ duration: 0.6 }}
//             className="lg:col-span-1"
//           >
//             <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 space-y-6">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-lg font-bold text-white">Profile</h2>
//                 <button
//                   onClick={() => setIsEditing(!isEditing)}
//                   className="p-2 text-white/80 hover:bg-white/20 rounded-lg transition"
//                 >
//                   <PencilIcon className="h-5 w-5" />
//                 </button>
//               </div>

//               {/* Avatar */}
//               <div className="text-center">
//                 <div className="relative inline-block">
//                   {user.avatar ? (
//                     <img
//                       src={user.avatar}
//                       alt={user.name}
//                       className="w-28 h-28 rounded-full object-cover mx-auto mb-3 border-4 border-pink-400 shadow-md"
//                     />
//                   ) : (
//                     <div className="w-28 h-28 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
//                       <UserCircleIcon className="h-16 w-16 text-white" />
//                     </div>
//                   )}
//                   {isEditing && (
//                     <label className="absolute bottom-2 right-0 p-2 bg-pink-500 rounded-full text-white shadow-md cursor-pointer hover:bg-pink-600 transition">
//                       <PencilIcon className="h-4 w-4" />
//                       <input
//                         type="file"
//                         accept="image/*"
//                         className="hidden"
//                         onChange={handlePhotoChange}
//                       />
//                     </label>
//                   )}
//                 </div>

//                 {isEditing ? (
//                   <input
//                     type="text"
//                     value={editData.name}
//                     onChange={(e) =>
//                       setEditData({ ...editData, name: e.target.value })
//                     }
//                     className="text-xl font-bold text-center bg-transparent border-b border-white/50 text-white focus:outline-none"
//                   />
//                 ) : (
//                   <h3 className="text-xl font-bold text-white">{user.name}</h3>
//                 )}

//                 <p className="text-pink-200 capitalize">{user.role}</p>
//               </div>

//               {/* Contact Info */}
//               <div className="space-y-3 text-sm text-white/90">
//                 <div className="flex items-center break-words">
//                   <EnvelopeIcon className="h-4 w-4 mr-2" /> {user.email}
//                 </div>
//                 <div className="flex items-center break-words">
//                   <LinkIcon className="h-4 w-4 mr-2" /> LinkedIn:{" "}
//                   {isEditing ? (
//                     <input
//                       value={editData.profile.linkedin}
//                       onChange={(e) =>
//                         setEditData({
//                           ...editData,
//                           profile: {
//                             ...editData.profile,
//                             linkedin: e.target.value,
//                           },
//                         })
//                       }
//                       className="border px-2 py-1 rounded w-full text-black"
//                     />
//                   ) : (
//                     <a
//                       href={user.profile.linkedin}
//                       className="truncate text-pink-200 hover:underline ml-1"
//                       target="_blank"
//                       rel="noreferrer"
//                     >
//                       {user.profile.linkedin}
//                     </a>
//                   )}
//                 </div>
//                 <div className="flex items-center break-words">
//                   <LinkIcon className="h-4 w-4 mr-2" /> GitHub:{" "}
//                   {isEditing ? (
//                     <input
//                       value={editData.profile.github}
//                       onChange={(e) =>
//                         setEditData({
//                           ...editData,
//                           profile: {
//                             ...editData.profile,
//                             github: e.target.value,
//                           },
//                         })
//                       }
//                       className="border px-2 py-1 rounded w-full text-black"
//                     />
//                   ) : (
//                     <a
//                       href={user.profile.github}
//                       className="truncate text-pink-200 hover:underline ml-1"
//                       target="_blank"
//                       rel="noreferrer"
//                     >
//                       {user.profile.github}
//                     </a>
//                   )}
//                 </div>
//                 <div className="flex items-center">
//                   <AcademicCapIcon className="h-4 w-4 mr-2" />{" "}
//                   {user.profile.education}
//                 </div>
//                 <div className="flex items-center">
//                   <BriefcaseIcon className="h-4 w-4 mr-2" />{" "}
//                   {user.profile.experience}
//                 </div>
//                 <div className="flex items-center">
//                   <StarIcon className="h-4 w-4 mr-2 text-yellow-300" />{" "}
//                   {user.profile.rating}/5
//                 </div>
//               </div>

//               {isEditing && (
//                 <div className="mt-6 flex space-x-3">
//                   <button
//                     onClick={handleSave}
//                     className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
//                   >
//                     Save
//                   </button>
//                   <button
//                     onClick={() => setIsEditing(false)}
//                     className="flex-1 border border-white/40 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               )}
//             </div>
//           </motion.div>

//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* About */}
//             <motion.div
//               variants={fadeIn}
//               initial="hidden"
//               animate="visible"
//               transition={{ duration: 0.6, delay: 0.2 }}
//               className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/30"
//             >
//               <h2 className="text-xl font-bold text-white mb-3">About</h2>
//               {isEditing ? (
//                 <textarea
//                   value={editData.profile.bio}
//                   onChange={(e) =>
//                     setEditData({
//                       ...editData,
//                       profile: { ...editData.profile, bio: e.target.value },
//                     })
//                   }
//                   rows={3}
//                   className="w-full border rounded-lg p-2 text-black"
//                 />
//               ) : (
//                 <p className="text-white/90">{user.profile.bio}</p>
//               )}
//             </motion.div>

//             {/* Skills */}
//             <motion.div
//               variants={fadeIn}
//               initial="hidden"
//               animate="visible"
//               transition={{ duration: 0.6, delay: 0.3 }}
//               className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/30"
//             >
//               <h2 className="text-xl font-bold text-white mb-3">Skills</h2>
//               {isEditing && (
//                 <input
//                   type="text"
//                   placeholder="Add skill & press Enter"
//                   onKeyPress={(e) => {
//                     if (e.key === "Enter") {
//                       addSkill(e.currentTarget.value);
//                       e.currentTarget.value = "";
//                     }
//                   }}
//                   className="border px-2 py-1 rounded w-full text-black mb-3"
//                 />
//               )}
//               <div className="flex flex-wrap gap-3">
//                 {editData.profile.skills.map((skill, i) => (
//                   <motion.span
//                     key={i}
//                     whileHover={{ scale: 1.1 }}
//                     className="bg-pink-200/80 text-pink-900 font-medium px-4 py-1 rounded-full shadow cursor-pointer"
//                     onClick={() => isEditing && removeSkill(skill)}
//                   >
//                     {skill}
//                   </motion.span>
//                 ))}
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import useProfileStore from "../../store/useProfileStore";
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  PencilIcon,
  EnvelopeIcon,
  LinkIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

// Animation Variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const rotateIn = {
  hidden: { opacity: 0, rotate: -10, scale: 0.9 },
  show: { opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.7, type: "spring" } },
};

const bounceIn = {
  hidden: { opacity: 0, scale: 0.3 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
};

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const { saveProfile, loadProfile } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const [editData, setEditData] = useState(() => ({
    ...user,
    profile: { ...user.profile },
  }));

  // Save updated profile
  const handleSave = async () => {
    try {
      let result;

      if (selectedAvatarFile) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('avatar', selectedAvatarFile);
        formData.append('name', editData.name);
        formData.append('profile', JSON.stringify(editData.profile));

        result = await saveProfile(editData._id, formData);
      } else {
        // Use regular object for non-file updates
        result = await saveProfile(editData);
      }

      setUser(result);
      setSelectedAvatarFile(null);
      setIsEditing(false);
      await loadProfile(editData._id);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedAvatarFile(file);
      setEditData({ ...editData, avatar: imageUrl });
    }
  };

  const addSkill = (skill) => {
    if (skill && !editData.profile.skills.includes(skill)) {
      setEditData({
        ...editData,
        profile: {
          ...editData.profile,
          skills: [...editData.profile.skills, skill],
        },
      });
    }
  };

  const removeSkill = (skill) => {
    setEditData({
      ...editData,
      profile: {
        ...editData.profile,
        skills: editData.profile.skills.filter((s) => s !== skill),
      },
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-900 to-blue-900">
        <p className="text-white text-lg">No user data found. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Floating shapes background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 overflow-hidden"
      >
        <motion.div
          className="w-72 h-72 bg-cyan-400 rounded-full blur-3xl absolute -top-10 -left-10"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="w-96 h-96 bg-blue-400 rounded-full blur-3xl absolute bottom-10 right-10"
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="w-64 h-64 bg-teal-400 rounded-full blur-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Main content */}
      <motion.div
        variants={container}
        initial={prefersReducedMotion ? "show" : "hidden"}
        animate="show"
        className="relative max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10 z-10"
      >
        {/* Sidebar */}
        <motion.div
          variants={slideInLeft}
          whileHover={{ scale: 1.02, rotateY: 2 }}
          whileTap={{ scale: 0.98 }}
          style={{ willChange: "transform" }}
          className="lg:col-span-1 bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 space-y-6 hover:shadow-2xl transition cursor-pointer"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Profile</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-white/80 hover:bg-white/20 rounded-lg transition"
            >
              <PencilIcon className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Avatar */}
          <div className="text-center">
            <motion.div
              variants={rotateIn}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95, rotate: -5 }}
              className="relative inline-block"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-3 border-4 border-cyan-400 shadow-lg ring-2 ring-cyan-400/30"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ring-2 ring-cyan-400/30">
                  <UserCircleIcon className="h-20 w-20 text-white" />
                </div>
              )}
              {isEditing && (
                <label className="absolute bottom-2 right-0 p-2 bg-cyan-500 rounded-full text-white shadow-md cursor-pointer hover:bg-cyan-600 transition">
                  <PencilIcon className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </motion.div>

            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="text-xl font-bold text-center bg-transparent border-b border-white/50 text-white focus:outline-none"
              />
            ) : (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-white"
              >
                {user.name}
              </motion.h3>
            )}
            <p className="text-cyan-200 capitalize">{user.role}</p>
          </div>

          {/* Contact Info */}
          <motion.div
            variants={container}
            className="space-y-3 text-sm text-white/90"
          >
            <motion.div variants={fadeInUp} className="flex items-center">
              <EnvelopeIcon className="h-4 w-4 mr-2" /> {user.email}
            </motion.div>
            <motion.div variants={fadeInUp} className="flex items-center">
              <LinkIcon className="h-4 w-4 mr-2" /> LinkedIn:{" "}
              {isEditing ? (
                <input
                  value={editData.profile.linkedin}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      profile: {
                        ...editData.profile,
                        linkedin: e.target.value,
                      },
                    })
                  }
                  className="border px-2 py-1 rounded w-full text-black"
                />
              ) : (
                <a
                  href={user.profile.linkedin}
                  className="truncate text-cyan-200 hover:underline ml-1"
                  target="_blank"
                  rel="noreferrer"
                >
                  {user.profile.linkedin}
                </a>
              )}
            </motion.div>
            <motion.div variants={fadeInUp} className="flex items-center">
              <LinkIcon className="h-4 w-4 mr-2" /> GitHub:{" "}
              {isEditing ? (
                <input
                  value={editData.profile.github}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      profile: {
                        ...editData.profile,
                        github: e.target.value,
                      },
                    })
                  }
                  className="border px-2 py-1 rounded w-full text-black"
                />
              ) : (
                <a
                  href={user.profile.github}
                  className="truncate text-cyan-200 hover:underline ml-1"
                  target="_blank"
                  rel="noreferrer"
                >
                  {user.profile.github}
                </a>
              )}
            </motion.div>
            <motion.div variants={fadeInUp} className="flex items-center">
              <AcademicCapIcon className="h-4 w-4 mr-2" />{" "}
              {isEditing ? (
                <input
                  value={editData.profile.education}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      profile: {
                        ...editData.profile,
                        education: e.target.value,
                      },
                    })
                  }
                  className="border px-2 py-1 rounded w-full text-black"
                  placeholder="Your education"
                />
              ) : (
                user.profile.education
              )}
            </motion.div>
            <motion.div variants={fadeInUp} className="flex items-center">
              <StarIcon className="h-4 w-4 mr-2 text-yellow-300" />{" "}
              {user.profile.rating}/5
            </motion.div>
          </motion.div>

          {/* Buttons */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6 flex space-x-3"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex-1 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition"
              >
                Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(false)}
                className="flex-1 border border-white/40 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
              >
                Cancel
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={slideInRight}
          className="lg:col-span-2 space-y-8"
        >
          {/* About */}
          <motion.div
            variants={bounceIn}
            whileHover={{ scale: 1.02, rotateX: 2 }}
            className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/30"
          >
            <h2 className="text-xl font-bold text-white mb-3">About</h2>
            {isEditing ? (
              <textarea
                value={editData.profile.bio}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    profile: { ...editData.profile, bio: e.target.value },
                  })
                }
                rows={3}
                className="w-full border rounded-lg p-2 text-black"
              />
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/90"
              >
                {user.profile.bio}
              </motion.p>
            )}
          </motion.div>

          {/* Skills */}
          <motion.div
            variants={bounceIn}
            whileHover={{ scale: 1.02, rotateX: 2 }}
            className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/30"
          >
            <h2 className="text-xl font-bold text-white mb-3">Skills</h2>
            {isEditing && (
              <motion.input
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                type="text"
                placeholder="Add skill & press Enter"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addSkill(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
                className="border px-2 py-1 rounded w-full text-black mb-3"
              />
            )}
            <div className="flex flex-wrap gap-3">
              {editData.profile.skills.map((skill, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{
                    scale: 1.15,
                    rotate: 5,
                    skewX: 2,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                  }}
                  whileTap={{ scale: 0.9, rotate: -5 }}
                  className="bg-cyan-200/80 text-cyan-900 font-medium px-4 py-1 rounded-full shadow cursor-pointer"
                  onClick={() => isEditing && removeSkill(skill)}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div
            variants={bounceIn}
            whileHover={{ scale: 1.02, rotateX: 2 }}
            className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/30"
          >
            <h2 className="text-xl font-bold text-white mb-3">Experience</h2>
            <div className="max-h-48 overflow-y-auto hide-scrollbar">
              {isEditing ? (
                <textarea
                  value={editData.profile.experience}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      profile: { ...editData.profile, experience: e.target.value },
                    })
                  }
                  rows={6}
                  className="w-full border rounded-lg p-2 text-black resize-none"
                  placeholder="Describe your professional experience..."
                />
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/90 whitespace-pre-wrap"
                >
                  {user.profile.experience}
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
