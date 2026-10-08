export interface UserDevice {
  id: string;
  name: string;
  deviceToken: string;
  deviceType: 'android' | 'ios' | 'web';
  createdAt: string;
  updatedAt: string;
  _count?: {
    notifications: number;
  };
}

export interface NotificationLog {
  id: string;
  userId?: string | null;
  user?: {
    name: string;
    deviceType: string;
    deviceToken?: string;
  } | null;
  title: string;
  body: string;
  data?: string | null;
  status: 'SUCCESS' | 'FAILED';
  response?: string | null;
  sentAt: string;
}

export interface SendNotificationPayload {
  deviceToken?: string;
  userId?: string;
  title: string;
  body: string;
  payloadData?: Record<string, any>;
}
