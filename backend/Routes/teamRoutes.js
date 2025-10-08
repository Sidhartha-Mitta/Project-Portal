import express from 'express';
import {
  getUserTeams,
  getTeamById,
  sendMessage,
  getTeamMessages,
  addReaction,
  editMessage,
  deleteMessage,
  addTeamMember,
  removeTeamMember,
  downloadAttachment
} from '../Controllers/teamController.js';
import { protect } from '../Middleware/authMiddleware.js';
import multer from 'multer';

// Configure multer for handling both files and FormData
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory for Cloudinary
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

const router = express.Router();

// All routes are protected
router.use(protect);

// Team routes
router.get('/', getUserTeams);
router.get('/:id', getTeamById);

// Team member management
router.post('/:id/members', addTeamMember);
router.delete('/:id/members/:userId', removeTeamMember);

// Message routes
router.get('/:id/messages', getTeamMessages);
router.post('/:id/messages', upload.any(), sendMessage);
router.put('/:teamId/messages/:messageId', editMessage);
router.delete('/:teamId/messages/:messageId', deleteMessage);

// File download routes
router.get('/:teamId/messages/:messageId/attachments/:attachmentIndex/download', downloadAttachment);

// Reaction routes
router.post('/:teamId/messages/:messageId/reactions', addReaction);

export default router;