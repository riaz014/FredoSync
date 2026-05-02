import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import prisma from '@fredo-cloud/database';
import { UserRole } from '@fredo-cloud/types';

export const requireWorkspaceAccess = (allowedRoles?: UserRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspaceId;
      const userId = req.user!.id;

      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID required' });
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'Access denied to this workspace' });
      }

      if (allowedRoles && !allowedRoles.includes(membership.role as UserRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
