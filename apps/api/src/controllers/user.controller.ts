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
  let filePath: string | null = null;
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    filePath = req.file.path;
    console.log('Avatar upload - File received:', { filename: req.file.filename, size: req.file.size });

    let avatarUrl: string;

    // Try to upload to Cloudinary if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        console.log('Uploading to Cloudinary...');
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'avatars',
          public_id: `avatar-${req.user!.id}`,
          overwrite: true,
          resource_type: 'auto',
        });

        avatarUrl = result.secure_url;
        console.log('Cloudinary upload successful:', avatarUrl);
      } catch (cloudinaryError: any) {
        console.warn('Cloudinary upload failed, using fallback:', cloudinaryError.message);
        // Fallback to DiceBear if Cloudinary fails
        avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user!.id}-${Date.now()}`;
      }
    } else {
      console.log('Cloudinary not configured, using DiceBear fallback');
      // Use DiceBear avatar service as fallback (free, no auth needed)
      avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user!.id}-${Date.now()}`;
    }

    // Delete local file after successful upload
    try {
      fs.unlinkSync(filePath);
      console.log('Temp file deleted');
    } catch (unlinkError) {
      console.error('Error deleting temp file:', unlinkError);
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatarUrl },
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

    console.log('User updated with new avatar');
    res.json(user);
  } catch (error: any) {
    console.error('Avatar upload error:', error.message || error);
    // Clean up local file on error
    if (filePath) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error deleting temp file on error:', unlinkError);
      }
    }
    next(error);
  }
};
