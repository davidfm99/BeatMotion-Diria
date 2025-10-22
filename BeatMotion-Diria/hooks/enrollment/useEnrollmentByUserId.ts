import { Query, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { firestore } from "@/firebaseConfig";
import {
  collection,
  CollectionReference,
  getDocs,
  onSnapshot,
  query as firestoreQuery,
  where,
} from "@firebase/firestore";
import { Alert } from "react-native";
import { enrollmentSchema, Enrollment } from "./schema";

export const useEnrollmentByUserId = (userId: string) => {
  const queryClient = useQueryClient();

  const enrollmentsRef = collection(
    firestore,
    "enrollments"
  ) as CollectionReference<Enrollment>;

  const fetchEnrollmentsById = async () => {
    try {
      const queryRef = firestoreQuery(
        enrollmentsRef,
        where("userId", "==", userId),
        where("status", "in", ["pending", "approved"])
      );
      const snapshot = await getDocs(queryRef);
      const enrollments = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      return enrollmentSchema.parse(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      Alert.alert("Error fetching enrollments");
      throw error;
    }
  };

  const query = useQuery({
    queryKey: ["enrollment", userId],
    queryFn: fetchEnrollmentsById,
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
