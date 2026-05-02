import { Router } from 'express';
import {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  createProgressUpdate,
} from '../controllers/goal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireWorkspaceAccess } from '../middleware/workspace.middleware';

const router = Router();

router.post('/', authenticate, createGoal);
router.get('/workspace/:workspaceId', authenticate, requireWorkspaceAccess(), getGoals);
router.get('/:id', authenticate, getGoal);
router.put('/:id', authenticate, updateGoal);
router.delete('/:id', authenticate, deleteGoal);
router.post('/:id/updates', authenticate, createProgressUpdate);

export default router;
