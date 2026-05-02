import { Router } from 'express';
import { getAuditLogs, exportAuditLogs } from '../controllers/audit-log.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireWorkspaceAccess } from '../middleware/workspace.middleware';

const router = Router();

router.get('/:workspaceId', authenticate, requireWorkspaceAccess(['ADMIN']), getAuditLogs);
router.get('/:workspaceId/export', authenticate, requireWorkspaceAccess(['ADMIN']), exportAuditLogs);

export default router;
