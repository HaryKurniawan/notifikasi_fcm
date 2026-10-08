import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const registerToken = async (req: Request, res: Response) => {
  try {
    const { name, deviceToken, deviceType } = req.body;

    if (!deviceToken) {
      return res.status(400).json({
        success: false,
        message: 'deviceToken wajib diisi',
      });
    }

    // Prisma ORM Upsert ke PostgreSQL
    const user = await prisma.user.upsert({
      where: { deviceToken },
      update: {
        name: name || 'User Mobile',
        deviceType: deviceType || 'android',
        updatedAt: new Date(),
      },
      create: {
        name: name || 'User Mobile',
        deviceToken,
        deviceType: deviceType || 'android',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Token device berhasil disimpan ke PostgreSQL via Prisma ORM',
      data: user,
    });
  } catch (error: any) {
    console.error('Error registerToken:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message,
    });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { notifications: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error getUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'User/Device berhasil dihapus dari database PostgreSQL',
    });
  } catch (error: any) {
    console.error('Error deleteUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus user: ' + error.message,
    });
  }
};
