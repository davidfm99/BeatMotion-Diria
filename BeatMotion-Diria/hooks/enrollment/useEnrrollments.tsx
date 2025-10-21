import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { firestore } from "@/firebaseConfig";
import { collection, getDocs, onSnapshot } from "@firebase/firestore";
import { Alert } from "react-native";
import { enrollmentSchema } from "./schema";

export const useEnrollments = () => {
  const queryClient = useQueryClient();

  const fetchEnrollments = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, "enrollments"));
      const enrollments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return enrollmentSchema.parse(enrollments);
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
  });

  // Will do updates in real time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(firestore, "enrollments"),
      (snapshot) => {
        const enrollments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        queryClient.setQueryData(["enrollments"], enrollments);
      }
    );

    return () => unsub();
  }, [queryClient]);

  return query;
};
