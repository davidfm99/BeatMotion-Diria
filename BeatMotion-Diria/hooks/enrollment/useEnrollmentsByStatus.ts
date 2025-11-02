import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";

import { firestore } from "@/firebaseConfig";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { useCourses } from "../courses/useCourses";
import { useUsers } from "../useUsers";
import { enrollmentSchema } from "./schema";

export const useEnrollmentsByStatus = (status: string) => {
  //   const queryClient = useQueryClient();
  const { data: courses } = useCourses();
  const { data: users } = useUsers();

  const getEnrollmentsByStatus = async () => {
    try {
      const queryRef = query(
        collection(firestore, "enrollments"),
        where("status", "==", status)
      );
      const snapshot = await getDocs(queryRef);
      const enrollments = snapshot.docs.map((doc) => {
        const enrollmentData = doc.data();
        const course = courses?.find((c) => c.id === enrollmentData.courseId);
        const user = users?.find((u) => u.id === enrollmentData.userId);
        return {
          id: doc.id,
          ...enrollmentData,
          course,
          user,
        };
      });
      return enrollmentSchema.parse(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments by status:", error);
      Alert.alert("Error fetching enrollments by status");
      throw error;
    }
  };

  return useQuery({
    queryKey: ["enrollments", status],
    queryFn: getEnrollmentsByStatus,
    staleTime: 1000 * 60 * 20, // 20 minutes
    refetchOnWindowFocus: false,
    enabled: !!courses && !!users,
  });
};
