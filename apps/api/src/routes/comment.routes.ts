import { Router } from 'express';
import { createComment, updateComment, deleteComment } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createComment);
router.put('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);

export default router;
