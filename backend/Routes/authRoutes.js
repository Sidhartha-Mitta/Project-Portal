import express from 'express';
import { registerUser, loginUser } from '../Controllers/authController.js';
import {protect} from "../Middleware/authMiddleware.js"

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;
