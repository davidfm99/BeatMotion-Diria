/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const onEnrollmentAccepted = onDocumentUpdated(
  "enrollments/{enrollmentId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const enrollmentId = event.params.enrollmentId;

    if (!before || !after) return;

    const now = admin.firestore.Timestamp.now();
    const oneMonthLater = admin.firestore.Timestamp.fromDate(
      new Date(now.toDate().setMonth(now.toDate().getMonth() + 1))
    );

    await db
      .collection("CourseMember")
      .add({
        enrollmentId: enrollmentId,
        userId: after.userId,
        courseId: after.courseId,
        joinedAt: now,
        active: true,
        nextPaymentDate: oneMonthLater,
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
);

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
