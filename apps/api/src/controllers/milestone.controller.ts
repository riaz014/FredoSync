import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '@fredo-cloud/database';
import { AuthRequest } from '../middleware/auth.middleware';

const createMilestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  goalId: z.string(),
  progressPercent: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional(),
});

export const createMilestone = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createMilestoneSchema.parse(req.body);

    const milestone = await prisma.milestone.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });

    res.status(201).json(milestone);
  } catch (error) {
    next(error);
  }
};

export const updateMilestone = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = createMilestoneSchema.partial().parse(req.body);

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });

    res.json(milestone);
  } catch (error) {
    next(error);
  }
};

export const deleteMilestone = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.milestone.delete({
      where: { id },
    });

    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    next(error);
  }
};
