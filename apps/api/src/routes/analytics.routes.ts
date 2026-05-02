import { Router } from 'express';
import { getAnalytics, exportWorkspaceData } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireWorkspaceAccess } from '../middleware/workspace.middleware';

const router = Router();

router.get('/:workspaceId', authenticate, requireWorkspaceAccess(), getAnalytics);
router.get('/:workspaceId/export', authenticate, requireWorkspaceAccess(), exportWorkspaceData);

export default router;
