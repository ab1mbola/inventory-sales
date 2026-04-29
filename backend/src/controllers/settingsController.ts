import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';

const SINGLETON_ID = 'singleton';

// Profile Settings
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.userId;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json(updatedUser);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req: any, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new passwords are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid old password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// Company Settings
export const getCompanySettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.companySettings.findUnique({
      where: { id: SINGLETON_ID },
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.companySettings.create({
        data: {
          id: SINGLETON_ID,
          name: 'Inventory Management System',
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch company settings' });
  }
};

export const updateCompanySettings = async (req: Request, res: Response) => {
  try {
    const { name, logo, copyrightText } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    // Logo validation
    if (logo) {
      // Basic check for base64 and size
      const sizeInBytes = (logo.length * 3) / 4;
      const maxSize = 1024 * 1024; // 1MB

      if (sizeInBytes > maxSize) {
        return res.status(400).json({ error: 'Logo must be smaller than 1MB' });
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      const match = logo.match(/^data:(image\/[a-z+]+);base64,/);
      if (!match || !allowedTypes.includes(match[1])) {
        return res.status(400).json({ error: 'Invalid logo format. Only PNG, JPG, JPEG, and SVG are allowed.' });
      }
    }

    const settings = await prisma.companySettings.upsert({
      where: { id: SINGLETON_ID },
      update: { name, logo, copyrightText },
      create: { id: SINGLETON_ID, name, logo, copyrightText },
    });

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update company settings' });
  }
};
