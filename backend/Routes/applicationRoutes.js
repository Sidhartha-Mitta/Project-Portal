import express from 'express';
import {
  getProjectApplications,
  updateApplicationStatus,
  getMyApplications
} from '../Controllers/applicationController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Student routes
router.get('/my-applications', getMyApplications);

// Project-specific application routes (apply route moved to projectRoutes.js)
router.get('/:id/applications', getProjectApplications);
router.put('/:projectId/applications/:applicationId', updateApplicationStatus);

export default router;