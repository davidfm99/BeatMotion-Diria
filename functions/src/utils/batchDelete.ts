import * as admin from "firebase-admin";

const db = admin.firestore();

export async function deleteByQueryInChunks(
  query: FirebaseFirestore.Query,
  chunkSize = 500,
) {
  while (true) {
    const snapshot = await query.limit(chunkSize).get();

    if (snapshot.empty) {
      break;
    }

    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}
