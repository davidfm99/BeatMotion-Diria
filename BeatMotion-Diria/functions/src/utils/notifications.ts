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

    const snapShot = await firestore
      .collection("pushTokens")
      .where("userId", "==", userId)
      .get();
    if (snapShot.empty) {
      logger.info(`No tokens for user ${userId}`);
      return;
    }
    const tokens = snapShot.docs.map((doc) => doc.get("token"));
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: "Tu próximo pago se acerca",
      body: `Solo un recordatorio: tu pago vence el día ${paymentDate}.`,
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    logger.info(
      `Payment reminder sent to ${tokens.length} device(s) for user ${userId}`
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

    const snapShot = await firestore
      .collection("pushTokens")
      .where("userId", "==", userId)
      .get();
    if (snapShot.empty) {
      logger.info(`No tokens for user ${userId}`);
      return;
    }
    const tokens = snapShot.docs.map((doc) => doc.get("token"));
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: "Ooops… pequeño tropiezo",
      body: `Tu pago está atrasado… pero prometemos no contárselo al resto del grupo.`,
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    logger.info(
      `Payment reminder sent to ${tokens.length} device(s) for user ${userId}`
    );
  } catch (er: any) {
    logger.error("Error sending push notification", er);
  }
};
