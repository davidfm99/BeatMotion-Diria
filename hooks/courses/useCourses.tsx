import { firestore } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "@firebase/firestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Alert } from "react-native";
import { courseSchema } from "./schema/courseSchema";

const courseQuery = query(
  collection(firestore, "courses"),
  where("isDeleted", "==", false),
  orderBy("createdAt", "desc"),
);

const fetchCourses = async () => {
  try {
    const snapshot = await getDocs(courseQuery);
    const courses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return courseSchema.parse(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    Alert.alert("Error fetching courses");
    throw error;
  }
};

export const useCourses = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
  });

  //Will do updates in real time
  useEffect(() => {
    const unsub = onSnapshot(courseQuery, (snapshot) => {
      const courses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      queryClient.setQueryData(["courses"], courses);
    });

    return () => unsub();
  }, [queryClient]);

  return query;
};
