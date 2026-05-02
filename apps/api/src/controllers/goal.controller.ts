import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '@fredo-cloud/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { createAuditLog } from '../utils/audit';

const createGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  workspaceId: z.string(),
  ownerId: z.string(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']).optional(),
  dueDate: z.string().optional(),
});

export const createGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createGoalSchema.parse(req.body);

    const goal = await prisma.goal.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        milestones: true,
      },
    });

    await createAuditLog({
      workspaceId: data.workspaceId,
      userId: req.user!.id,
      action: 'CREATE',
      entity: 'GOAL',
      entityId: goal.id,
      changes: { title: goal.title },
      req,
    });

    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
};

export const getGoals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

    const goals = await prisma.goal.findMany({
      where: { workspaceId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        milestones: true,
        _count: {
          select: {
            actionItems: true,
            progressUpdates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(goals);
  } catch (error) {
    next(error);
  }
};

export const getGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        milestones: true,
        actionItems: {
          include: {
            assignee: {
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
        progressUpdates: {
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
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    res.json(goal);
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = createGoalSchema.partial().parse(req.body);

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        milestones: true,
      },
    });

    await createAuditLog({
      workspaceId: goal.workspaceId,
      userId: req.user!.id,
      action: 'UPDATE',
      entity: 'GOAL',
      entityId: id,
      changes: data,
      req,
    });

    res.json(goal);
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id },
      select: { workspaceId: true },
    });

    await prisma.goal.delete({
      where: { id },
    });

    if (goal) {
      await createAuditLog({
        workspaceId: goal.workspaceId,
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'GOAL',
        entityId: id,
        changes: {},
        req,
      });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const createProgressUpdate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const update = await prisma.progressUpdate.create({
      data: {
        content,
        goalId: id,
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

    res.status(201).json(update);
  } catch (error) {
    next(error);
  }
};
