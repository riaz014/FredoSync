import { Router } from 'express';
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin,
} from '../controllers/announcement.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireWorkspaceAccess } from '../middleware/workspace.middleware';

const router = Router();

router.post('/', authenticate, createAnnouncement);
router.get('/workspace/:workspaceId', authenticate, requireWorkspaceAccess(), getAnnouncements);
router.get('/:id', authenticate, getAnnouncement);
router.put('/:id', authenticate, updateAnnouncement);
router.delete('/:id', authenticate, deleteAnnouncement);
router.post('/:id/pin', authenticate, togglePin);

export default router;
