import {
  MessagingPayload,
  Notification,
} from "firebase-admin/lib/messaging/messaging-api";
import admin from "firebase-admin";

type SingleNotificationParam = {
  title: string;
  body: string;
  data?: any;
};

export const sendSingleNotification = async (
  token: string,
  config: SingleNotificationParam
) => {
  const { title, body, data } = config;
  const payload: MessagingPayload = {
    notification: {
      title,
      body,
    },
    ...(data && { data }),
  };
  const messaging = await admin
    .messaging()
    .sendToDevice(token, payload, { priority: "high" });

  return messaging;
};

export const sendMultipleNotification = async (
  tokens: Array<string>,
  notification: Notification,
  data?: any
) => {
  const messaging = await admin.messaging().sendMulticast({
    android: {
      priority: "high",
    },
    tokens,
    data,
    notification: notification,
  });

  return messaging;
};
