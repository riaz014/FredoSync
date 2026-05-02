import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '@fredo-cloud/database';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import fs from 'fs';

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const userId = req.user!.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill' }],
    });

    fs.unlinkSync(req.file.path);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatarUrl: result.secure_url },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
