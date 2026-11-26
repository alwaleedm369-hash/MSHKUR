import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config } from '@config';
import { logger } from '@utils/logger';
import { verifyToken } from '@utils/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface ServerToClientEvents {
  notification: (data: any) => void;
  jobUpdate: (data: any) => void;
  message: (data: any) => void;
  typing: (data: { userId: string; isTyping: boolean }) => void;
  presence: (data: { userId: string; status: 'online' | 'offline' }) => void;
  jobProgress: (data: { jobId: string; progress: number; status: string }) => void;
}

interface ClientToServerEvents {
  authenticate: (token: string) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  typing: (data: { room: string; isTyping: boolean }) => void;
  sendMessage: (data: { room: string; message: string }) => void;
  subscribeJobs: (jobIds: string[]) => void;
  unsubscribeJobs: (jobIds: string[]) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId?: string;
  userRole?: string;
  rooms: Set<string>;
  subscribedJobs: Set<string>;
}

let io: any = null;

export const socketService = {
  io: null as any,

  initialize(httpServer: any) {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Authentication middleware
    io.use(async (socket: any, next: any) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify JWT token
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        socket.data.userId = decoded.userId;
        socket.data.userRole = decoded.role;
        socket.data.rooms = new Set();
        socket.data.subscribedJobs = new Set();
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    io.on('connection', (socket: any) => {
      logger.info(`Socket connected: ${socket.id} (User: ${socket.data.userId})`);

      // Join user's personal room
      socket.join(`user:${socket.data.userId}`);

      // Handle authentication
      socket.on('authenticate', (token: string) => {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          socket.data.userId = decoded.userId;
          socket.data.userRole = decoded.role;
          socket.join(`user:${decoded.userId}`);
          socket.emit('authenticated', { success: true });
        } catch (error) {
          socket.emit('authenticated', { success: false, error: 'Invalid token' });
        }
      });

      // Join room
      socket.on('joinRoom', (room: string) => {
        socket.join(room);
        socket.data.rooms.add(room);
      });

      // Leave room
      socket.on('leaveRoom', (room: string) => {
        socket.leave(room);
        socket.data.rooms.delete(room);
      });

      // Typing indicator
      socket.on('typing', (data: { room: string; isTyping: boolean }) => {
        socket.to(data.room).emit('typing', {
          userId: socket.data.userId,
          isTyping: data.isTyping,
        });
      });

      // Send message
      socket.on('sendMessage', (data: { room: string; message: string }) => {
        const message = {
          id: `msg-${Date.now()}`,
          userId: socket.data.userId,
          message: data.message,
          timestamp: Date.now(),
        };
        io.to(data.room).emit('message', message);
      });

      // Job subscriptions
      socket.on('subscribeJobs', (jobIds: string[]) => {
        jobIds.forEach((id: string) => {
          socket.join(`job:${id}`);
          socket.data.subscribedJobs.add(id);
        });
      });

      socket.on('unsubscribeJobs', (jobIds: string[]) => {
        jobIds.forEach((id: string) => {
          socket.leave(`job:${id}`);
          socket.data.subscribedJobs.delete(id);
        });
      });

      // Handle disconnect
      socket.on('disconnect', (reason: string) => {
        console.log(`Socket disconnected: ${socket.id} (${reason})`);
      });

      // Handle errors
      socket.on('error', (error: Error) => {
        console.error(`Socket error: ${socket.id}`, error);
      });
    });

    this.io = io;
    logger.info('Socket.IO server initialized');
  },

  // Emit notification to specific user
  notifyUser(userId: string, notification: any) {
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }
  },

  // Emit to room
  emitToRoom(room: string, event: string, data: any) {
    if (io) {
      io.to(room).emit(event, data);
    }
  },

  // Job progress update
  emitJobProgress(jobId: string, progress: number, status: string, result?: any) {
    if (io) {
      io.to(`job:${jobId}`).emit('jobProgress', { jobId, progress, status, result });
    }
  },

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    if (io) {
      io.emit(event, data);
    }
  },

  // Get connected users count
  getConnectedUsersCount(): number {
    if (io) {
      return io.engine.clientsCount;
    }
    return 0;
  },

  // Get user's socket rooms
  getUserRooms(userId: string): string[] {
    if (io) {
      const socket = io.sockets.sockets.get(userId);
      return socket ? Array.from(socket.rooms) : [];
    }
    return [];
  },

  // Check if user is online
  isUserOnline(userId: string): boolean {
    if (io) {
      const sockets = io.sockets.sockets;
      for (const [, socket] of sockets) {
        if (socket.data.userId === userId) return true;
      }
    }
    return false;
  },

  // Get all connected users
  getOnlineUsers(): string[] {
    const users: string[] = [];
    if (io) {
      for (const [, socket] of io.sockets.sockets) {
        if (socket.data.userId) users.push(socket.data.userId);
      }
    }
    return users;
  },
};

export { io };

export default {
  io: null as any,
  initialize: socketService.initialize,
  notifyUser: socketService.notifyUser,
  emitToRoom: socketService.emitToRoom,
  emitJobProgress: socketService.emitJobProgress,
  broadcast: socketService.broadcast,
  getConnectedUsersCount: socketService.getConnectedUsersCount,
  getUserRooms: socketService.getUserRooms,
  isUserOnline: socketService.isUserOnline,
  getOnlineUsers: socketService.getOnlineUsers,
};