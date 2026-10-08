import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { firebaseMessaging, expo, Expo } from '../config/firebase';

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { deviceToken, userId, title, body, payloadData } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Judul (title) dan isi (body) notifikasi wajib diisi',
      });
    }

    let targetToken = deviceToken;
    let targetUser = null;

    if (userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (targetUser) {
        targetToken = targetUser.deviceToken;
      }
    } else if (targetToken) {
      targetUser = await prisma.user.findUnique({
        where: { deviceToken: targetToken },
      });
    }

    if (!targetToken) {
      return res.status(400).json({
        success: false,
        message: 'Token device tidak ditemukan. Masukkan deviceToken atau userId valid.',
      });
    }

    let status = 'FAILED';
    let responseDetails = '';

    if (Expo.isExpoPushToken(targetToken)) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync([
          {
            to: targetToken,
            sound: 'default',
            priority: 'high',
            channelId: 'default',
            title,
            body,
            data: payloadData || {},
          },
        ]);
        status = 'SUCCESS';
        responseDetails = JSON.stringify(ticketChunk);
      } catch (err: any) {
        responseDetails = `Expo Push Error: ${err.message}`;
      }
    } else if (firebaseMessaging) {
      try {
        const response = await firebaseMessaging.send({
          token: targetToken,
          notification: { title, body },
          data: payloadData ? { info: JSON.stringify(payloadData) } : {},
          android: {
            priority: 'high',
            notification: { sound: 'default', channelId: 'default' },
          },
        });
        status = 'SUCCESS';
        responseDetails = response;
      } catch (err: any) {
        responseDetails = `FCM Error: ${err.message}`;
      }
    } else {
      status = 'SUCCESS';
      responseDetails = 'Simulasi Kirim FCM (Service account belum dikonfigurasi, pesan tersimpan ke PostgreSQL DB)';
    }

    const log = await prisma.notificationLog.create({
      data: {
        userId: targetUser ? targetUser.id : null,
        title,
        body,
        data: payloadData ? JSON.stringify(payloadData) : null,
        status,
        response: typeof responseDetails === 'string' ? responseDetails : JSON.stringify(responseDetails),
      },
    });

    return res.status(200).json({
      success: status === 'SUCCESS',
      message: status === 'SUCCESS' ? 'Notifikasi berhasil dikirim!' : 'Gagal mengirim notifikasi.',
      data: { log, responseDetails },
    });
  } catch (error: any) {
    console.error('Error sendNotification:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message,
    });
  }
};

export const sendToAll = async (req: Request, res: Response) => {
  try {
    const { title, body, payloadData } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Judul (title) dan isi (body) wajib diisi',
      });
    }

    const users = await prisma.user.findMany();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Belum ada device user terdaftar di PostgreSQL database.',
      });
    }

    const results = [];
    for (const user of users) {
      let status = 'FAILED';
      let responseDetails = '';

      if (Expo.isExpoPushToken(user.deviceToken)) {
        try {
          const ticket = await expo.sendPushNotificationsAsync([
            {
              to: user.deviceToken,
              sound: 'default',
              priority: 'high',
              channelId: 'default',
              title,
              body,
              data: payloadData || {},
            },
          ]);
          status = 'SUCCESS';
          responseDetails = JSON.stringify(ticket);
        } catch (err: any) {
          responseDetails = err.message;
        }
      } else if (firebaseMessaging) {
        try {
          const resFcm = await firebaseMessaging.send({
            token: user.deviceToken,
            notification: { title, body },
          });
          status = 'SUCCESS';
          responseDetails = resFcm;
        } catch (err: any) {
          responseDetails = err.message;
        }
      } else {
        status = 'SUCCESS';
        responseDetails = 'Simulasi Broadcast FCM';
      }

      const log = await prisma.notificationLog.create({
        data: {
          userId: user.id,
          title,
          body,
          data: payloadData ? JSON.stringify(payloadData) : null,
          status,
          response: typeof responseDetails === 'string' ? responseDetails : JSON.stringify(responseDetails),
        },
      });
      results.push(log);
    }

    return res.status(200).json({
      success: true,
      message: `Notifikasi dikirim ke ${users.length} device.`,
      data: results,
    });
  } catch (error: any) {
    console.error('Error sendToAll:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message,
    });
  }
};

export const getNotificationHistory = async (_req: Request, res: Response) => {
  try {
    const history = await prisma.notificationLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { name: true, deviceType: true, deviceToken: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('Error getNotificationHistory:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message,
    });
  }
};

export const clearHistory = async (_req: Request, res: Response) => {
  try {
    await prisma.notificationLog.deleteMany();
    return res.status(200).json({
      success: true,
      message: 'Riwayat notifikasi berhasil dibersihkan dari PostgreSQL database',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Gagal membersihkan riwayat: ' + error.message,
    });
  }
};
