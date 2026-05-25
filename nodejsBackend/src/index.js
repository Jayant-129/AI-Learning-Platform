require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const logger = require('./logger');
const { setupSocketHandlers } = require('./socketHandler');
const { createAndEmit, broadcastNotification } = require('./notificationService');

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'learner_platform_jwt_secret_key_2024_super_secure';

// ---- Express App ----
const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Morgan HTTP logging → Winston
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ---- Socket.IO ----
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// JWT authentication middleware for Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (!token) {
    // Allow unauthenticated connections for development
    logger.warn(`Socket connection without token: ${socket.id}`);
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    logger.info(`Socket authenticated: ${decoded.sub || decoded.email || 'unknown'}`);
    next();
  } catch (err) {
    logger.warn(`Socket JWT verification failed: ${err.message}`);
    // Still allow connection but without user context
    next();
  }
});

// Set up socket event handlers
setupSocketHandlers(io);

// ---- REST Endpoints ----

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'notification-service',
    connectedClients: io.engine.clientsCount,
    uptime: process.uptime(),
  });
});

// Send notification to a specific user
app.post('/notify', async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    logger.info(`REST: Notify user ${userId}: ${message}`);
    const notification = await createAndEmit(io, userId, message, type || 'INFO');
    res.json({ success: true, notification });
  } catch (error) {
    logger.error(`REST notify error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Broadcast notification to all users
app.post('/notify/broadcast', async (req, res) => {
  try {
    const { message, type } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    logger.info(`REST: Broadcast: ${message}`);
    await broadcastNotification(io, message, type || 'INFO');
    res.json({ success: true, message: 'Broadcast sent' });
  } catch (error) {
    logger.error(`REST broadcast error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Get connected clients count
app.get('/status', (req, res) => {
  res.json({
    connectedClients: io.engine.clientsCount,
    uptime: process.uptime(),
    rooms: [...io.sockets.adapter.rooms.keys()].filter(r => r.startsWith('user-') || r.startsWith('role-')),
  });
});

// ---- Start Server ----
server.listen(PORT, () => {
  logger.info(`🚀 Notification service running on port ${PORT}`);
  logger.info(`   REST: http://localhost:${PORT}`);
  logger.info(`   WebSocket: ws://localhost:${PORT}`);
});

module.exports = { app, server, io };
