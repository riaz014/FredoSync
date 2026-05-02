import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '@fredo-cloud/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const initializeSocket = (io: SocketIOServer) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
        userId: string;
      };

      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join workspace room
    socket.on('join:workspace', async (workspaceId: string) => {
      try {
        // Verify user has access to workspace
        const membership = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: socket.userId!,
            },
          },
        });

        if (!membership) {
          socket.emit('error', { message: 'Access denied to workspace' });
          return;
        }

        socket.join(`workspace:${workspaceId}`);

        // Update online status
        await prisma.workspaceMember.update({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: socket.userId!,
            },
          },
          data: {
            isOnline: true,
            lastSeenAt: new Date(),
          },
        });

        // Broadcast presence update
        const members = await prisma.workspaceMember.findMany({
          where: { workspaceId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        });

        io.to(`workspace:${workspaceId}`).emit('presence:changed', members);

        console.log(`User ${socket.userId} joined workspace ${workspaceId}`);
      } catch (error) {
        console.error('Error joining workspace:', error);
        socket.emit('error', { message: 'Failed to join workspace' });
      }
    });

    // Leave workspace room
    socket.on('leave:workspace', async (workspaceId: string) => {
      try {
        socket.leave(`workspace:${workspaceId}`);

        // Update online status
        await prisma.workspaceMember.updateMany({
          where: {
            workspaceId,
            userId: socket.userId!,
          },
          data: {
            isOnline: false,
            lastSeenAt: new Date(),
          },
        });

        // Broadcast presence update
        const members = await prisma.workspaceMember.findMany({
          where: { workspaceId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        });

        io.to(`workspace:${workspaceId}`).emit('presence:changed', members);

        console.log(`User ${socket.userId} left workspace ${workspaceId}`);
      } catch (error) {
        console.error('Error leaving workspace:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        // Update all workspace memberships to offline
        await prisma.workspaceMember.updateMany({
          where: { userId: socket.userId! },
          data: {
            isOnline: false,
            lastSeenAt: new Date(),
          },
        });

        console.log(`User disconnected: ${socket.userId}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });

  return io;
};

// Helper function to emit to workspace
export const emitToWorkspace = (
  io: SocketIOServer,
  workspaceId: string,
  event: string,
  data: any
) => {
  io.to(`workspace:${workspaceId}`).emit(event, data);
};
