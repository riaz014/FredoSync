import { Router } from 'express';
import { addReaction, removeReaction } from '../controllers/reaction.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, addReaction);
router.delete('/:id', authenticate, removeReaction);

export default router;
