import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '@fredo-cloud/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendMentionEmail } from '../config/email';

const createCommentSchema = z.object({
  content: z.string().min(1),
  announcementId: z.string(),
  parentId: z.string().optional(),
});

const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
};

export const createComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createCommentSchema.parse(req.body);

    const comment = await prisma.comment.create({
      data: {
        ...data,
        userId: req.user!.id,
      },
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
    });

    // Handle @mentions
    const mentions = extractMentions(data.content);
    if (mentions.length > 0) {
      const announcement = await prisma.announcement.findUnique({
        where: { id: data.announcementId },
        select: { workspaceId: true },
      });

      if (announcement) {
        const mentionedUsers = await prisma.user.findMany({
          where: {
            OR: [
              { firstName: { in: mentions } },
              { lastName: { in: mentions } },
              { email: { in: mentions.map((m) => `${m}@*`) } },
            ],
            workspaceMemberships: {
              some: { workspaceId: announcement.workspaceId },
            },
          },
        });

        for (const mentionedUser of mentionedUsers) {
          if (mentionedUser.id !== req.user!.id) {
            await prisma.notification.create({
              data: {
                type: 'MENTION',
                title: 'You were mentioned',
                message: `${comment.user.firstName} ${comment.user.lastName} mentioned you in a comment`,
                userId: mentionedUser.id,
                link: `/announcements/${data.announcementId}`,
              },
            });

            try {
              await sendMentionEmail(
                mentionedUser.email,
                `${comment.user.firstName} ${comment.user.lastName}`,
                data.content,
                `/announcements/${data.announcementId}`
              );
            } catch (emailError) {
              console.error('Failed to send mention email:', emailError);
            }
          }
        }
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
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

    res.json(comment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.comment.delete({
      where: { id },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
