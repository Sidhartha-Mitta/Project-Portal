import express from 'express';
import multer from 'multer';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  getProjectsForSession,
  submitProject,
  updateSubmissionStatus,
  approveProject,
  rateProject,
  getDashboardData
} from '../Controllers/projectController.js';
import {
  applyToProject,
  getProjectApplications,
  updateApplicationStatus
} from '../Controllers/applicationController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for zip files
  }
});

// Specific upload for submissions (zip files)
const submissionUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream'
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed for submissions'), false);
    }
  }
});

// Public routes
router.get('/', getAllProjects);

// Protected routes
router.get('/session', protect, getProjectsForSession);
router.get('/user/my-projects', protect, getMyProjects);

// Public routes with parameters (must come after specific routes)
router.get('/:id', getProjectById);

// Protected routes with parameters
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

// Application routes
router.post('/:id/apply', protect, upload.single('resume'), applyToProject);
router.get('/:id/applications', protect, getProjectApplications);
router.put('/:projectId/applications/:applicationId', protect, updateApplicationStatus);

// Submission routes
router.post('/:id/submit', protect, submissionUpload.single('zipFile'), submitProject);
router.put('/:id/submissions/:submissionId', protect, updateSubmissionStatus);

// Approval routes
router.put('/:id/approve', protect, approveProject);

// Rating routes
router.post('/:id/rate', protect, rateProject);

// Dashboard route
router.get('/dashboard/data', protect, getDashboardData);

export default router;