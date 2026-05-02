import { Response, NextFunction } from 'express';
import prisma from '@fredo-cloud/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { stringify } from 'csv-stringify/sync';

export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

    const totalGoals = await prisma.goal.count({
      where: { workspaceId },
    });

    const completedGoals = await prisma.goal.count({
      where: { workspaceId, status: 'COMPLETED' },
    });

    const inProgressGoals = await prisma.goal.count({
      where: { workspaceId, status: 'IN_PROGRESS' },
    });

    const totalActionItems = await prisma.actionItem.count({
      where: { workspaceId },
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const completedThisWeek = await prisma.actionItem.count({
      where: {
        workspaceId,
        status: 'DONE',
        updatedAt: { gte: oneWeekAgo },
      },
    });

    const overdueCount = await prisma.actionItem.count({
      where: {
        workspaceId,
        status: { not: 'DONE' },
        dueDate: { lt: new Date() },
      },
    });

    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    // Weekly progress data for charts
    const weeks = [];
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const completed = await prisma.actionItem.count({
        where: {
          workspaceId,
          status: 'DONE',
          updatedAt: { gte: weekStart, lt: weekEnd },
        },
      });

      weeks.push({
        week: `Week ${7 - i}`,
        completed,
      });
    }

    res.json({
      totalGoals,
      completedGoals,
      inProgressGoals,
      totalActionItems,
      completedThisWeek,
      overdueCount,
      completionRate: Math.round(completionRate),
      weeklyProgress: weeks,
    });
  } catch (error) {
    next(error);
  }
};

export const exportWorkspaceData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

    const goals = await prisma.goal.findMany({
      where: { workspaceId },
      include: {
        owner: true,
        milestones: true,
        actionItems: {
          include: {
            assignee: true,
          },
        },
      },
    });

    const rows = [];
    for (const goal of goals) {
      for (const actionItem of goal.actionItems) {
        rows.push({
          Goal: goal.title,
          'Goal Status': goal.status,
          'Goal Owner': `${goal.owner.firstName} ${goal.owner.lastName}`,
          'Goal Due Date': goal.dueDate?.toISOString() || '',
          'Action Item': actionItem.title,
          'Action Status': actionItem.status,
          Priority: actionItem.priority,
          Assignee: actionItem.assignee
            ? `${actionItem.assignee.firstName} ${actionItem.assignee.lastName}`
            : '',
          'Due Date': actionItem.dueDate?.toISOString() || '',
          Created: actionItem.createdAt.toISOString(),
        });
      }
    }

    const csv = stringify(rows, {
      header: true,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=workspace-data.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
