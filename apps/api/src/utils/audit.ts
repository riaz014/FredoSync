import { Request } from 'express';
import prisma from '@fredo-cloud/database';

interface CreateAuditLogParams {
  workspaceId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: any;
  req: Request;
}

export const createAuditLog = async (params: CreateAuditLogParams) => {
  const { workspaceId, userId, action, entity, entityId, changes, req } = params;

  await prisma.auditLog.create({
    data: {
      workspaceId,
      userId,
      action,
      entity,
      entityId,
      changes,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    },
  });
};
