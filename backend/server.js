import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import authRoutes from "./Routes/authRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import projectRoutes from "./Routes/projectRoutes.js";
import applicationRoutes from "./Routes/applicationRoutes.js";
import teamRoutes from "./Routes/teamRoutes.js";
import cors from "cors";
import multer from 'multer';
import Team from "./Models/Team.js";
import User from "./Models/User.js";

const app = express();
const server = createServer(app);

// Configure multer for handling both files and FormData
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory for Cloudinary
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true
}));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL],
    credentials: true
  }
});

// Socket.IO middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.user.name} connected with socket ID: ${socket.id}`);

  // Join team room
  socket.on('join-team', async (teamId) => {
    try {
      const team = await Team.findById(teamId);
      if (!team || !team.isMember(socket.user._id)) {
        socket.emit('error', 'Not authorized to join this team');
        return;
      }

      socket.join(`team-${teamId}`);
      console.log(`User ${socket.user.name} joined team-${teamId}`);

      socket.emit('joined-team', { teamId, message: `Welcome to team ${team.name}` });
    } catch (error) {
      console.error('Join team error:', error);
      socket.emit('error', 'Failed to join team');
    }
  });

  // Leave team room
  socket.on('leave-team', (teamId) => {
    socket.leave(`team-${teamId}`);
    console.log(`User ${socket.user.name} left team-${teamId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`team-${data.teamId}`).emit('user-typing', {
      userId: socket.user._id,
      userName: socket.user.name,
      teamId: data.teamId
    });
  });

  socket.on('stop-typing', (data) => {
    socket.to(`team-${data.teamId}`).emit('user-stop-typing', {
      userId: socket.user._id,
      userName: socket.user.name,
      teamId: data.teamId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.name} disconnected`);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/teams", teamRoutes);

// Global error handler
app.use((error, req, res, next) => {
  let errorMessage = 'Something went wrong';
  let statusCode = 500;

  if (error instanceof multer.MulterError) {
    // Multer-specific errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File too large. Maximum size is 10MB';
      statusCode = 400;
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      errorMessage = 'Unexpected file field';
      statusCode = 400;
    } else {
      errorMessage = error.message;
      statusCode = 400;
    }
  } else if (error.message) {
    errorMessage = error.message;
    statusCode = error.statusCode || 500;
  }

  console.error('Global error handler:', error);

  res.status(statusCode).json({
    success: false,
    message: errorMessage
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error(err));

// Export io for use in controllers
export { io };
