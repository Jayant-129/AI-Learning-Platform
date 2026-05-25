import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import logger from '../utils/logger';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export function SocketProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Connect to Socket.IO with JWT auth
    const socket = io(SOCKET_URL, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      logger.info('Socket.IO connected:', socket.id);
      setConnected(true);

      // Join user-specific room
      socket.emit('join-room', {
        userId: user.id,
        role: user.role,
      });
    });

    socket.on('room-joined', (data) => {
      logger.info('Joined room:', data.room);
    });

    socket.on('notification', (notification) => {
      logger.info('Notification received:', notification.message);
      setNotifications((prev) => [notification, ...prev]);
    });

    socket.on('disconnect', (reason) => {
      logger.warn('Socket.IO disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      logger.error('Socket.IO connection error:', error.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, user, token]);

  const clearNotifications = () => setNotifications([]);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        notifications,
        clearNotifications,
        removeNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
