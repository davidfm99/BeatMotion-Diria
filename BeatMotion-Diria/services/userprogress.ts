import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export type UserProgress = {
  userId: string;
  level: number;
  classesCompleted: number;
  totalClasses: number;
  progress: number;
  monthlyProgress: number[];
  createdAt: any;
  updatedAt: any;
};

// Devuelve el primer y último día de un mes
function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return { start, end };
}

export async function getOrCreateUserProgress(targetUserId: string): Promise<UserProgress | null> {
  try {
    const db = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) return null;

    // Revisar rol del admin
    const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
    const currentUserRole = currentUserDoc.exists() ? currentUserDoc.data()?.role : null;
    const isAdmin = currentUserRole === "admin";

    // Referencia al progreso
    const progressRef = doc(db, "userprogress", targetUserId);
    const progressSnap = await getDoc(progressRef);

    // --- Contar clases asistidas desde attendance ---
    const attendanceCollection = collection(db, "attendance");
    const attendanceQuery = query(
      attendanceCollection,
      where("userId", "==", targetUserId),
      where("attended", "==", true)
    );
    const attendanceSnap = await getDocs(attendanceQuery);
    const attendedClasses = attendanceSnap.size;

    // --- Contar clases matriculadas desde enrollments ---
    const enrollmentCollection = collection(db, "enrollments");
    const enrollmentQuery = query(
      enrollmentCollection,
      where("userId", "==", targetUserId)
    );
    const enrollmentSnap = await getDocs(enrollmentQuery);
    const enrolledClasses = enrollmentSnap.size;

    // --- Progreso mensual: solo de agosto a diciembre ---
    const monthlyProgress: number[] = [];
    const today = new Date();
    const year = today.getFullYear();

    for (let month = 7; month <= 11; month++) { // Agosto=7, Sept=8, ... Dic=11
      const { start: monthStart, end: monthEnd } = getMonthRange(year, month);

      // Attendance dentro del mes
      const monthAttendanceQuery = query(
        attendanceCollection,
        where("userId", "==", targetUserId),
        where("attended", "==", true),
        where("createdAt", ">=", Timestamp.fromDate(monthStart)),
        where("createdAt", "<=", Timestamp.fromDate(monthEnd))
      );
      const monthAttendanceSnap = await getDocs(monthAttendanceQuery);

      // Enrollments dentro del mes (opcional, si quieres contarlas también)
      const monthEnrollmentQuery = query(
        enrollmentCollection,
        where("userId", "==", targetUserId),
        where("joinedAt", ">=", monthStart),
        where("joinedAt", "<=", monthEnd)
      );
      const monthEnrollmentSnap = await getDocs(monthEnrollmentQuery);

      // Sumar ambos
      monthlyProgress.push(monthAttendanceSnap.size + monthEnrollmentSnap.size);
    }

    // --- Calcular progreso ---
    const classesCompleted = attendedClasses;
    const totalClasses = Math.max(enrolledClasses, 10); // mínimo 20
    const progress = Math.round((classesCompleted / totalClasses) * 100);
    const level = Math.floor(progress / 10) + 1;

    const data: UserProgress = {
      userId: targetUserId,
      level,
      classesCompleted,
      totalClasses,
      progress,
      monthlyProgress,
      createdAt: progressSnap.exists() ? progressSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (progressSnap.exists()) {
      if (isAdmin) await updateDoc(progressRef, data);
    } else {
      if (!isAdmin) return null;
      await setDoc(progressRef, data);
    }

    return data;
  } catch (err) {
    console.error("Error creando o actualizando progreso:", err);
    return null;
  }
}
