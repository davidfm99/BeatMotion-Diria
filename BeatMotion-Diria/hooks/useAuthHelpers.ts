import { ref, get } from 'firebase/database';
import { db } from '../firebaseConfig'; 

export const fetchUserRole = async (uid: string) => {
  const snapshot = await get(ref(db, `users/${uid}`));
  if (snapshot.exists()) {
    return snapshot.val().role;
  }
  return null;
};
