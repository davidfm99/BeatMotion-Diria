/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { HttpsError, onCall } from "firebase-functions/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Triggered when an enrollment document is updated
export const onEnrollmentAccepted = onDocumentUpdated(
  "enrollments/{enrollmentId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const enrollmentId = event.params.enrollmentId;

    if (!before || !after) return;

    const oneMonthLater = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    if (before.status !== "approved" && after.status === "approved") {
      await db
        .collection("courseMember")
        .add({
          enrollmentId: enrollmentId,
          userId: after.userId,
          courseId: after.courseId,
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
          active: true,
          paymentStatus: "ok", // pending | late | ok
          attendanceCount: 0,
          nextPaymentDate: oneMonthLater,
          createdBy: after.reviewedBy || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          console.log(
            `CourseMember document created for enrollment ID: ${enrollmentId}`
          );
        })
        .catch((error) => {
          console.error(
            `Error creating CourseMember document for enrollment ID: ${enrollmentId}`,
            error
          );
        });
    }
  }
);

interface NotificationPayload {
  title: string;
  content: string;
  userRole: string;
}

export const sendExpoPushNotification = onCall(async (data) => {
  try {
    const { title, content, userRole } =
      data.data as unknown as NotificationPayload;

    if (!title || !content || !userRole) {
      throw new Error("Missing title, body or UserRole");
    }

    let tokens = [];
    const snapShot =
      userRole !== "all"
        ? await db.collection("pushTokens").where("role", "==", userRole).get()
        : await db.collection("pushTokens").get();
    if (snapShot.docs) {
      const tokens = snapShot.docs.map((doc) => doc.get("token"));
      const messages = tokens.map((token) => ({
        to: token,
        sound: "default",
        title,
        body: content,
      }));

      const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      await expoRes.json();
      const userIds = snapShot.docs.map((doc) => doc.id);
      const batch = db.batch();
      console.log(userIds);
      userIds.forEach((userId) => {
        const ref = db.collection("notificationsSent").doc();
        batch.set(ref, {
          userId,
          title,
          content,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false,
        });
      });
      batch.commit();
    }
    return { success: tokens.length, failed: 0 };
  } catch (er: any) {
    console.error("Error sending push notification", er);
    throw new HttpsError("internal", "Error sending push notification");
  }
});

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
