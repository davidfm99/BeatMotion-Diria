import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { Alert } from "react-native";
import { useCourses } from "../courses/useCourses";
import { useUsers } from "../user/useUsers";
import { enrollmentSchema } from "./schema";

export const useEnrollmentById = (id?: string) => {
  const { data: courses } = useCourses();
  const { data: users } = useUsers();

  const getEnrollment = async () => {
    try {
      if (!id) return null;

      const ref = doc(firestore, "enrollments", id);
      const snapshot = await getDoc(ref);

      if (!snapshot.exists()) return null;

      const enrollmentData = snapshot.data();

      const course = courses?.find((c) => c.id === enrollmentData.courseId);
      const user = users?.find((u) => u.id === enrollmentData.userId);

      return enrollmentSchema.parse([
        { id: snapshot.id, ...enrollmentData, course, user },
      ])[0];
    } catch (error) {
      console.error("Error fetching enrollment by ID:", error);
      Alert.alert("Error", "No se pudo cargar la matrícula.");
      throw error;
    }
  };

  return useQuery({
    queryKey: ["enrollment", id],
    queryFn: getEnrollment,
    enabled: !!id && !!courses && !!users,
    staleTime: 1000 * 60 * 20,
  });
};
