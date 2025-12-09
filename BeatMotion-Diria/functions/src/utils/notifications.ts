import * as admin from "firebase-admin";
import { logger } from "firebase-functions";

export const sendPaymentReminderNotification = async (
  userId: string,
  paymentDate: Date,
  firestore: admin.firestore.Firestore
): Promise<void> => {
  try {
    if (!paymentDate || !userId) {
      logger.error("Missing userId or paymentDate");
    }

    const snapShot = await firestore.collection("pushTokens").doc(userId).get();
    if (snapShot.exists) {
      logger.info(`No tokens for user ${userId}`);
      return;
    }
    const token = snapShot.get("token");
    const messages = {
      to: token,
      sound: "default",
      title: "Tu próximo pago se acerca",
      body: `Solo un recordatorio: tu pago vence el proximo ${formatDate(
        paymentDate
      )}.`,
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    logger.info(
      `Payment reminder sent to ${token} device(s) for user ${userId}`
    );
  } catch (er: any) {
    logger.error("Error sending push notification", er);
  }
};

export const sendOverdueNotification = async (
  userId: string,
  paymentDate: Date,
  firestore: admin.firestore.Firestore
): Promise<void> => {
  try {
    if (!paymentDate || !userId) {
      logger.error("Missing userId or paymentDate");
    }

    const snapShot = await firestore.collection("pushTokens").doc(userId).get();
    if (snapShot.exists) {
      logger.info(`No tokens for user ${userId}`);
      return;
    }
    const token = snapShot.get("token");
    const messages = {
      to: token,
      sound: "default",
      title: "Ooops… pequeño tropiezo",
      body: `Tu pago está atrasado… pero prometemos no contárselo al resto del grupo.`,
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    logger.info(`Payment overdue sent to ${token} device for user ${userId}`);
  } catch (er: any) {
    logger.error("Error sending push notification", er);
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};
