import { Router } from 'express';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  updateMemberRole,
  getMembers,
  getInvitations,
  cancelInvitation,
} from '../controllers/workspace.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireWorkspaceAccess } from '../middleware/workspace.middleware';
import { UserRole } from '@fredo-cloud/types';

const router = Router();

router.post('/', authenticate, createWorkspace);
router.get('/', authenticate, getWorkspaces);
router.get('/:workspaceId', authenticate, requireWorkspaceAccess(), getWorkspace);
router.put('/:workspaceId', authenticate, requireWorkspaceAccess([UserRole.ADMIN]), updateWorkspace);
router.delete('/:workspaceId', authenticate, requireWorkspaceAccess([UserRole.ADMIN]), deleteWorkspace);
router.post('/:workspaceId/invite', authenticate, requireWorkspaceAccess([UserRole.ADMIN]), inviteMember);
router.get('/:workspaceId/invite', authenticate, requireWorkspaceAccess(), getInvitations);
router.delete('/:workspaceId/invite/:invitationId', authenticate, requireWorkspaceAccess([UserRole.ADMIN]), cancelInvitation);
router.get('/:workspaceId/members', authenticate, requireWorkspaceAccess(), getMembers);
router.delete('/:workspaceId/members/:userId', authenticate, requireWorkspaceAccess([UserRole.ADMIN]), removeMember);
router.put('/:workspaceId/members/:userId/role', authenticate, requireWorkspaceAccess([UserRole.ADMIN]), updateMemberRole);

export default router;
