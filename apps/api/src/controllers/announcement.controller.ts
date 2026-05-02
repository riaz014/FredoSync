import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '@fredo-cloud/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  workspaceId: z.string(),
});

export const createAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createAnnouncementSchema.parse(req.body);

    const announcement = await prisma.announcement.create({
      data,
      include: {
        comments: {
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
        },
        reactions: {
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
        },
      },
    });

    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

    const announcements = await prisma.announcement.findMany({
      where: { workspaceId },
      include: {
        comments: {
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
            replies: {
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
            },
          },
          where: { parentId: null },
          orderBy: { createdAt: 'asc' },
        },
        reactions: {
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
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

export const getAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        comments: {
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
          orderBy: { createdAt: 'asc' },
        },
        reactions: {
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
        },
      },
    });

    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    res.json(announcement);
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = createAnnouncementSchema.partial().parse(req.body);

    const announcement = await prisma.announcement.update({
      where: { id },
      data,
      include: {
        comments: {
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
          orderBy: { createdAt: 'asc' },
        },
        reactions: {
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
        },
      },
    });

    res.json(announcement);
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.announcement.delete({
      where: { id },
    });

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const togglePin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: { isPinned: !announcement.isPinned },
      include: {
        comments: {
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
          orderBy: { createdAt: 'asc' },
        },
        reactions: {
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
        },
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
