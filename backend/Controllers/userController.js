import User from "../Models/User.js";
import { uploadAvatarToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import cloudinary from "../utils/cloudinary.js";

// GET /api/users/:id
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle avatar upload if file is provided
    if (req.file) {
      try {
        // Delete old avatar from Cloudinary if it exists
        if (user.avatar && user.avatar.includes('cloudinary')) {
          // Extract public ID from Cloudinary URL
          const urlParts = user.avatar.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const publicId = `project-portal/avatars/${fileName.split('.')[0]}`;
          await deleteFromCloudinary(publicId);
        }

        // Upload new avatar to Cloudinary
        const result = await uploadAvatarToCloudinary(req.file.buffer, req.file.mimetype);
        user.avatar = result.secure_url;
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        return res.status(500).json({ message: "Failed to upload avatar" });
      }
    }

    // Only allow specific top-level fields
    const allowedTop = ["name"];
    for (const key of allowedTop) {
      if (key in req.body) user[key] = req.body[key];
    }

    // Merge nested profile
    if (req.body.profile) {
      let profileData;
      if (typeof req.body.profile === "string") {
        try {
          profileData = JSON.parse(req.body.profile);
        } catch (parseError) {
          console.error('Error parsing profile JSON:', parseError);
          return res.status(400).json({ message: "Invalid profile data format" });
        }
      } else if (typeof req.body.profile === "object") {
        profileData = req.body.profile;
      }

      if (profileData && typeof profileData === "object") {
        const current = user.profile?.toObject
          ? user.profile.toObject()
          : user.profile || {};
        user.profile = { ...current, ...profileData };
      }
    }

    await user.save();
    const safe = user.toObject();
    delete safe.password;
    return res.json(safe);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
