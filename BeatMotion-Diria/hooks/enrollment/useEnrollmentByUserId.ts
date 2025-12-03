import { firestore } from "@/firebaseConfig";
import {
  collection,
  CollectionReference,
  query as firestoreQuery,
  getDocs,
  where,
} from "@firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import { Enrollment, enrollmentSchema } from "./schema";

export const useEnrollmentByUserId = (userId: string) => {
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

  return query;
};
