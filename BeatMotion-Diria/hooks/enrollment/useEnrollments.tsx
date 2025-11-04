import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { firestore } from "@/firebaseConfig";
import { collection, getDocs, onSnapshot } from "@firebase/firestore";
import { Alert } from "react-native";
import { enrollmentSchema } from "./schema";
import { useCourses } from "../courses/useCourses";
import { useUsers } from "../useUsers";

export const useEnrollments = () => {
  const queryClient = useQueryClient();
  const { data: courses } = useCourses();
  const { data: users } = useUsers();

  const fetchEnrollments = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, "enrollments"));
      const joinedData = snapshot.docs.map((doc) => {
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
      return enrollmentSchema.parse(joinedData);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      Alert.alert("Error fetching enrollments");
      throw error;
    }
  };

  const query = useQuery({
    queryKey: ["enrollments"],
    queryFn: fetchEnrollments,
    staleTime: 1000 * 60 * 20, // 20 minutes
    refetchOnWindowFocus: false,
    enabled: !!courses && !!users,
  });

  // Will do updates in real time
  useEffect(() => {
    if (!courses || !users) return;
    const unsub = onSnapshot(
      collection(firestore, "enrollments"),
      (snapshot) => {
        const joinedData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const course = courses.find((c) => c.id === data.courseId);
          const user = users.find((u) => u.id === data.userId);
          return { id: doc.id, ...data, course, user };
        });
        queryClient.setQueryData(
          ["enrollments"],
          enrollmentSchema.parse(joinedData)
        );
      }
    );

    return () => unsub();
  }, [queryClient, courses, users]);

  return query;
};
