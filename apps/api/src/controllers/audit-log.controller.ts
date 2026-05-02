import { Response, NextFunction } from 'express';
import prisma from '@fredo-cloud/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { stringify } from 'csv-stringify/sync';

export const getAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;
    const { startDate, endDate, entity, action, userId } = req.query;

    const where: any = { workspaceId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const logs = await prisma.auditLog.findMany({
      where,
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
      take: 100,
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const exportAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

    const logs = await prisma.auditLog.findMany({
      where: { workspaceId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = logs.map((log) => ({
      Timestamp: log.createdAt.toISOString(),
      User: `${log.user.firstName} ${log.user.lastName}`,
      Email: log.user.email,
      Action: log.action,
      Entity: log.entity,
      'Entity ID': log.entityId,
      Changes: JSON.stringify(log.changes),
      'IP Address': log.ipAddress || '',
      'User Agent': log.userAgent || '',
    }));

    const csv = stringify(rows, {
      header: true,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
