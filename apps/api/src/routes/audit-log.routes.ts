import { Router } from 'express';
import { getAuditLogs, exportAuditLogs } from '../controllers/audit-log.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireWorkspaceAccess } from '../middleware/workspace.middleware';
import { UserRole } from '@fredo-cloud/types';

const router = Router();

router.get('/:workspaceId', authenticate, requireWorkspaceAccess([UserRole.ADMIN]), getAuditLogs);
router.get('/:workspaceId/export', authenticate, requireWorkspaceAccess([UserRole.ADMIN]), exportAuditLogs);

export default router;
