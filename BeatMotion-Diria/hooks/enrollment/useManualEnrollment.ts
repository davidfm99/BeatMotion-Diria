import { firestore } from "@/firebaseConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Alert } from "react-native";

type ManualEnrollmentData = {
  userId: string;
  courseId: string;
  assignedBy: string;
  totalAmount?: number;
};

const checkExistingEnrollment = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    const enrollmentsRef = collection(firestore, "enrollments");
    const q = query(
      enrollmentsRef,
      where("userId", "==", userId),
      where("courseId", "==", courseId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking existing enrollment:", error);
    return false;
  }
};

const createManualEnrollment = async (data: ManualEnrollmentData) => {
  const { userId, courseId, assignedBy, totalAmount = 0 } = data;

  const exists = await checkExistingEnrollment(userId, courseId);
  if (exists) {
    throw new Error(
      "El estudiante ya está inscrito en este curso o tiene una solicitud pendiente."
    );
  }

  const enrollmentRef = collection(firestore, "enrollments");
  const newEnrollment = await addDoc(enrollmentRef, {
    userId,
    courseId,
    status: "approved",
    assignmentType: "manual",
    submittedAt: serverTimestamp(),
    reviewedBy: assignedBy,
    reviewedAt: serverTimestamp(),
    totalAmount,
    paymentProofImage: null,
  });

  return newEnrollment.id;
};

export const useManualEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createManualEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      queryClient.invalidateQueries({ queryKey: ["courseMember"] });
      Alert.alert(
        "Éxito",
        "El estudiante ha sido asignado al curso correctamente."
      );
    },
    onError: (error: any) => {
      console.error("Error en asignación manual:", error);
      Alert.alert(
        "Error",
        error.message || "No se pudo asignar el estudiante al curso."
      );
    },
  });
};

export const useAvailableStudents = (courseId: string) => {
  return {
    queryKey: ["availableStudents", courseId],
    queryFn: async () => {
      try {
        const usersRef = collection(firestore, "users");
        const usersQuery = query(usersRef, where("role", "==", "user"));
        const usersSnapshot = await getDocs(usersQuery);

        const allStudents = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const enrollmentsRef = collection(firestore, "enrollments");
        const enrollmentsQuery = query(
          enrollmentsRef,
          where("courseId", "==", courseId)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

        const enrolledUserIds = new Set(
          enrollmentsSnapshot.docs.map((doc) => doc.data().userId)
        );

        const availableStudents = allStudents.filter(
          (student: any) => !enrolledUserIds.has(student.id)
        );

        return availableStudents;
      } catch (error) {
        console.error("Error fetching available students:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  };
};
