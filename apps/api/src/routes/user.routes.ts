import { Router } from 'express';
import { updateProfile, uploadAvatar } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
