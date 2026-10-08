import * as admin from 'firebase-admin';
import { Expo } from 'expo-server-sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export let firebaseMessaging: admin.messaging.Messaging | null = null;
export const expo = new Expo();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);

if (fs.existsSync(resolvedPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseMessaging = admin.messaging();
    console.log('✅ Firebase Admin SDK berhasil diinisialisasi untuk FCM native.');
  } catch (error: any) {
    console.warn('⚠️ Gagal memuat service account Firebase:', error.message);
  }
} else {
  console.log('ℹ️ File serviceAccountKey.json tidak ditemukan. FCM native akan fallback ke mode Simulasi / Expo Push Service.');
}

export { admin, Expo };
