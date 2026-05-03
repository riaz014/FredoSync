import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getWorkspaceNotifications } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireWorkspaceAccess } from '../middleware/workspace.middleware';

const router = Router();

router.post('/mark-all-read', authenticate, markAllAsRead);
router.get('/', authenticate, getNotifications);
router.get('/workspace/:workspaceId', authenticate, requireWorkspaceAccess(), getWorkspaceNotifications);
router.put('/:id', authenticate, markAsRead);
router.delete('/:id', authenticate, deleteNotification);

export default router;
