import { Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import prisma from '@fredo-cloud/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { sendInvitationEmail } from '../config/email';
import { createAuditLog } from '../utils/audit';

const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  accentColor: z.string().optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']),
});

export const createWorkspace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createWorkspaceSchema.parse(req.body);
    const userId = req.user!.id;

    const workspace = await prisma.workspace.create({
      data: {
        ...data,
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
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

    await createAuditLog({
      workspaceId: workspace.id,
      userId,
      action: 'CREATE',
      entity: 'WORKSPACE',
      entityId: workspace.id,
      changes: { name: workspace.name },
      req,
    });

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
};

export const getWorkspaces = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
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
        _count: {
          select: {
            goals: true,
            actionItems: true,
          },
        },
      },
    });

    res.json(workspaces);
  } catch (error) {
    next(error);
  }
};

export const getWorkspace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
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
        _count: {
          select: {
            goals: true,
            actionItems: true,
            announcements: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    res.json(workspace);
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;
    const data = createWorkspaceSchema.parse(req.body);

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data,
    });

    await createAuditLog({
      workspaceId,
      userId: req.user!.id,
      action: 'UPDATE',
      entity: 'WORKSPACE',
      entityId: workspaceId,
      changes: data,
      req,
    });

    res.json(workspace);
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;
    const data = inviteMemberSchema.parse(req.body);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember) {
        throw new AppError('User is already a member', 400);
      }
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');

    const invitation = await prisma.invitation.create({
      data: {
        email: data.email,
        workspaceId,
        role: data.role,
        token: inviteToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    try {
      await sendInvitationEmail(data.email, workspace.name, inviteToken);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }

    await createAuditLog({
      workspaceId,
      userId: req.user!.id,
      action: 'INVITE',
      entity: 'MEMBER',
      entityId: invitation.id,
      changes: { email: data.email, role: data.role },
      req,
    });

    res.status(201).json(invitation);
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
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

    res.json(members);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId, userId } = req.params;

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    await createAuditLog({
      workspaceId,
      userId: req.user!.id,
      action: 'REMOVE',
      entity: 'MEMBER',
      entityId: userId,
      changes: {},
      req,
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;

    const member = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: { role },
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

    await createAuditLog({
      workspaceId,
      userId: req.user!.id,
      action: 'UPDATE_ROLE',
      entity: 'MEMBER',
      entityId: userId,
      changes: { role },
      req,
    });

    res.json(member);
  } catch (error) {
    next(error);
  }
};

export const getInvitations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

    const invitations = await prisma.invitation.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invitations);
  } catch (error) {
    next(error);
  }
};

export const cancelInvitation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId, invitationId } = req.params;

    await prisma.invitation.delete({
      where: {
        id: invitationId,
        workspaceId,
      },
    });

    await createAuditLog({
      workspaceId,
      userId: req.user!.id,
      action: 'DELETE',
      entity: 'INVITATION',
      entityId: invitationId,
      req,
    });

    res.json({ message: 'Invitation canceled' });
  } catch (error) {
    next(error);
  }
};
