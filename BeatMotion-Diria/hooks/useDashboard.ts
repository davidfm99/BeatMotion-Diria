import { useQuery } from "@tanstack/react-query";
import { firestore } from "@/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";


export const useActiveStudents = () =>
  useQuery({
    queryKey: ["users", "activeStudents"],
    queryFn: async () => {
      const q = query(
        collection(firestore, "users"),
        where("role", "==", "admin"),
        where("active", "==", true)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
    staleTime: 1000 * 60 * 1, 
    refetchOnWindowFocus: false,
  });

export const useActiveTeachers = () =>
  useQuery({
    queryKey: ["users", "activeTeachers"],
    queryFn: async () => {
      const q = query(
        collection(firestore, "users"),
        where("role", "==", "teacher"),
        where("active", "==", true)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false,
  });

export const useCoursesCount = () =>
  useQuery({
    queryKey: ["courses", "count"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(firestore, "courses"));
      return snapshot.size;
    },
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false,
  });

export const useClassesCount = () =>
  useQuery({
    queryKey: ["classes", "count"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(firestore, "classes"));
      return snapshot.size;
    },
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false,
  });


export const useApprovedEnrollments = () =>
  useQuery({
    queryKey: ["enrollments", "approved"],
    queryFn: async () => {
      const q = query(
        collection(firestore, "enrollments"),
        where("status", "==", "approved")
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false,
  });