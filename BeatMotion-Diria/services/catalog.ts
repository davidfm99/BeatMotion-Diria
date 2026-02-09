import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export type NewCourse = {
  title: string;
  description: string;
  level: string;
  teacher: string;
  imageUrl?: string;
  isDeleted: boolean;
  createdBy: string;
  day: string;
};

export async function addCourse(data: NewCourse) {
  const db = getFirestore();
  const ref = await addDoc(collection(db, "courses"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCourse(id: string, patch: Partial<NewCourse>) {
  const db = getFirestore();
  await updateDoc(doc(db, "courses", id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCourse(id: string) {
  const db = getFirestore();
  await deleteDoc(doc(db, "courses", id));
}

export type ClassPatch = {
  courseId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  capacity?: number;
  notes?: string;
};

export async function getClassDetail(id: string) {
  const db = getFirestore();
  const snap = await getDoc(doc(db, "classes", id));
  if (!snap.exists()) return null;
  return { id, ...(snap.data() as any) };
}

export async function updateClassDetail(id: string, patch: ClassPatch) {
  const db = getFirestore();
  await updateDoc(doc(db, "classes", id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteClassDetail(id: string) {
  const db = getFirestore();
  await deleteDoc(doc(db, "classes", id));
}
