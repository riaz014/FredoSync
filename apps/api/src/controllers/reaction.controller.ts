import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '@fredo-cloud/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const addReactionSchema = z.object({
  emoji: z.string().min(1),
  announcementId: z.string(),
});

export const addReaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = addReactionSchema.parse(req.body);

    // Check if user already has this reaction
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        emoji: data.emoji,
        announcementId: data.announcementId,
        userId: req.user!.id,
      },
    });

    // If exists, remove it (toggle off)
    if (existingReaction) {
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
      return res.json({ message: 'Reaction removed' });
    }

    // Otherwise, create new reaction
    const reaction = await prisma.reaction.create({
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
      },
    });

    res.status(201).json(reaction);
  } catch (error) {
    next(error);
  }
};

export const removeReaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const reaction = await prisma.reaction.findUnique({
      where: { id },
    });

    if (!reaction) {
      throw new AppError('Reaction not found', 404);
    }

    // Only allow users to remove their own reactions
    if (reaction.userId !== req.user!.id) {
      throw new AppError('Unauthorized to delete this reaction', 403);
    }

    await prisma.reaction.delete({
      where: { id },
    });

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    next(error);
  }
};
