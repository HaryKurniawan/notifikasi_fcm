import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import notificationRoutes from './routes/notificationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (_req, res) => {
  res.json({
    message: '🚀 Backend Notifikasi FCM & PostgreSQL Prisma ORM Berjalan! (TypeScript)',
    status: 'Online',
    endpoints: {
      registerToken: 'POST /api/users/register',
      getUsers: 'GET /api/users',
      sendNotification: 'POST /api/notifications/send',
      sendToAll: 'POST /api/notifications/send-all',
      getHistory: 'GET /api/notifications/history',
    },
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`🔥 Server FCM Backend (TypeScript + PostgreSQL) running at http://localhost:${PORT}`);
    console.log(`================================================`);
  });
}

export default app;
