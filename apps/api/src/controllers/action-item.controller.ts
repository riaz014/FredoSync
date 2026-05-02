import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '@fredo-cloud/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { createAuditLog } from '../utils/audit';

const createActionItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  workspaceId: z.string(),
  goalId: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional(),
});

export const createActionItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createActionItemSchema.parse(req.body);

    const actionItem = await prisma.actionItem.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
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
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    await createAuditLog({
      workspaceId: data.workspaceId,
      userId: req.user!.id,
      action: 'CREATE',
      entity: 'ACTION_ITEM',
      entityId: actionItem.id,
      changes: { title: actionItem.title },
      req,
    });

    res.status(201).json(actionItem);
  } catch (error) {
    next(error);
  }
};

export const getActionItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

    const actionItems = await prisma.actionItem.findMany({
      where: { workspaceId },
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
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });

    res.json(actionItems);
  } catch (error) {
    next(error);
  }
};

export const getActionItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const actionItem = await prisma.actionItem.findUnique({
      where: { id },
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
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!actionItem) {
      throw new AppError('Action item not found', 404);
    }

    res.json(actionItem);
  } catch (error) {
    next(error);
  }
};

export const updateActionItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = createActionItemSchema.partial().parse(req.body);

    const actionItem = await prisma.actionItem.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
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
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    await createAuditLog({
      workspaceId: actionItem.workspaceId,
      userId: req.user!.id,
      action: 'UPDATE',
      entity: 'ACTION_ITEM',
      entityId: id,
      changes: data,
      req,
    });

    res.json(actionItem);
  } catch (error) {
    next(error);
  }
};

export const deleteActionItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const actionItem = await prisma.actionItem.findUnique({
      where: { id },
      select: { workspaceId: true },
    });

    await prisma.actionItem.delete({
      where: { id },
    });

    if (actionItem) {
      await createAuditLog({
        workspaceId: actionItem.workspaceId,
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'ACTION_ITEM',
        entityId: id,
        changes: {},
        req,
      });
    }

    res.json({ message: 'Action item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
