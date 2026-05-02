import { Response } from 'express';
import { internal_unscoped_prisma as prisma } from '../db/client';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Profile Settings
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    const userId = req.user!.id;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // req.db.user.update is already scoped by req.db extension
    const updatedUser = await req.db.user.update({
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

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new passwords are required' });
    }

    // findUnique is scoped by req.db
    const user = await req.db.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid old password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await req.db.user.update({
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
export const getCompanySettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;

    // Company is NOT currently scoped by the factory extension because it lacks a 'companyId' field
    // We query it by its 'id' which is the companyId from the token.
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch company settings' });
  }
};

export const updateCompanySettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, logo, copyrightText } = req.body;
    const companyId = req.user!.companyId;

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    // Logo validation
    if (logo) {
      const sizeInBytes = (logo.length * 3) / 4;
      const maxSize = 1024 * 1024; // 1MB

      if (sizeInBytes > maxSize) {
        return res.status(400).json({ error: 'Logo must be smaller than 1MB' });
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      const match = logo.match(/^data:(image\/[a-z+]+);base64,/);
      if (!match || !allowedTypes.includes(match[1])) {
        return res.status(400).json({ error: 'Invalid logo format.' });
      }
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: { name, logo, copyrightText },
    });

    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update company settings' });
  }
};
