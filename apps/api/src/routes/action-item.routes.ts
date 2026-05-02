import { Router } from 'express';
import {
  createActionItem,
  getActionItems,
  getActionItem,
  updateActionItem,
  deleteActionItem,
} from '../controllers/action-item.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireWorkspaceAccess } from '../middleware/workspace.middleware';

const router = Router();

router.post('/', authenticate, createActionItem);
router.get('/workspace/:workspaceId', authenticate, requireWorkspaceAccess(), getActionItems);
router.get('/:id', authenticate, getActionItem);
router.put('/:id', authenticate, updateActionItem);
router.delete('/:id', authenticate, deleteActionItem);

export default router;
