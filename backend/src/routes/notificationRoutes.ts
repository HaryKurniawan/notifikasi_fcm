import { Router } from 'express';
import {
  sendNotification,
  sendToAll,
  getNotificationHistory,
  clearHistory,
} from '../controllers/notificationController';

const router = Router();

router.post('/send', sendNotification);
router.post('/send-all', sendToAll);
router.get('/history', getNotificationHistory);
router.delete('/history', clearHistory);

export default router;
