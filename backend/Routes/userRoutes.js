import express from "express";
import multer from "multer";
import {
  getUserProfile,
  updateUserProfile,
} from "../Controllers/userController.js";

const router = express.Router();

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get profile by MongoDB _id
router.get("/:id", getUserProfile);

// Update profile with avatar upload
router.put("/:id", upload.single('avatar'), updateUserProfile);

export default router;
  