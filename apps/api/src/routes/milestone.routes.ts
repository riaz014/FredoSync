import { Router } from 'express';
import { createMilestone, updateMilestone, deleteMilestone } from '../controllers/milestone.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createMilestone);
router.put('/:id', authenticate, updateMilestone);
router.delete('/:id', authenticate, deleteMilestone);

export default router;
