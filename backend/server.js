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

const getMongoConnectionHint = (error) => {
  if (!process.env.MONGO_URI) {
    return "MONGO_URI is missing. Add it to backend/.env.";
  }

  if (error?.code === "ENOTFOUND" || error?.syscall === "querySrv") {
    return "MongoDB Atlas host could not be resolved. Check the cluster hostname in MONGO_URI and your DNS/network connection.";
  }

  if (
    error?.code === 8000 ||
    error?.codeName === "AtlasError" ||
    /Authentication failed|bad auth/i.test(error?.message || "")
  ) {
    return "MongoDB Atlas authentication failed. Update the username/password in backend/.env to match a Database Access user in Atlas. If the password contains special characters, URL-encode it before putting it in MONGO_URI.";
  }

  return "MongoDB connection failed. Check MONGO_URI and Atlas network access settings.";
};

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5001;
const localOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];
const deployedOrigins = [
  "https://project-portal-vert.vercel.app",
  "https://projectportal-xki3.onrender.com",
  ...((process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)),
];
const allowedOrigins = [...new Set([...localOrigins, ...deployedOrigins])];

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the process using it, or change PORT in backend/.env.`);
  } else {
    console.error("Server failed to start:", error.message);
  }

  process.exit(1);
});

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
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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
const mountRoutes = (prefix = "") => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/projects`, projectRoutes);
  app.use(`${prefix}/applications`, applicationRoutes);
  app.use(`${prefix}/teams`, teamRoutes);
};

app.get("/", (req, res) => {
  res.json({ success: true, message: "Project Portal API is running" });
});

mountRoutes("/api");
// Backwards-compatible mounts for deployed clients configured without `/api`.
mountRoutes();

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

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
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.error(getMongoConnectionHint(err));
    process.exit(1);
  });

// Export io for use in controllers
export { io };
