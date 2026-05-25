const logger = require('./logger');

/**
 * Set up Socket.IO event handlers.
 * @param {import('socket.io').Server} io - The Socket.IO server instance
 */
function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join user-specific room for targeted notifications
    socket.on('join-room', (data) => {
      const { userId, role } = data;
      if (userId) {
        const room = `user-${userId}`;
        socket.join(room);
        logger.info(`Socket ${socket.id} joined room: ${room} (role: ${role || 'unknown'})`);

        // Also join role-based room
        if (role) {
          socket.join(`role-${role}`);
          logger.info(`Socket ${socket.id} joined role room: role-${role}`);
        }

        // Acknowledge join
        socket.emit('room-joined', { room, userId });
      }
    });

    // Leave a room
    socket.on('leave-room', (data) => {
      const { userId } = data;
      if (userId) {
        const room = `user-${userId}`;
        socket.leave(room);
        logger.info(`Socket ${socket.id} left room: ${room}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id} (reason: ${reason})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}: ${error.message}`);
    });
  });

  logger.info('Socket.IO handlers initialized');
}

/**
 * Send a notification to a specific user via Socket.IO.
 * @param {import('socket.io').Server} io
 * @param {number} userId
 * @param {object} notification
 */
function sendToUser(io, userId, notification) {
  const room = `user-${userId}`;
  io.to(room).emit('notification', notification);
  logger.info(`Notification sent to room ${room}: ${notification.message}`);
}

/**
 * Broadcast a notification to all connected clients.
 * @param {import('socket.io').Server} io
 * @param {object} notification
 */
function broadcast(io, notification) {
  io.emit('notification', notification);
  logger.info(`Broadcast notification: ${notification.message}`);
}

/**
 * Send a notification to all users with a specific role.
 * @param {import('socket.io').Server} io
 * @param {string} role
 * @param {object} notification
 */
function sendToRole(io, role, notification) {
  const room = `role-${role}`;
  io.to(room).emit('notification', notification);
  logger.info(`Notification sent to role ${role}: ${notification.message}`);
}

module.exports = {
  setupSocketHandlers,
  sendToUser,
  broadcast,
  sendToRole,
};
