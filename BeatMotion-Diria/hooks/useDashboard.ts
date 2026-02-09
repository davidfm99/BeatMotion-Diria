import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";

export const useActiveStudents = () =>
  useQuery({
    queryKey: ["usersActiveStudents"],
    queryFn: async () => {
      const q = query(
        collection(firestore, "users"),
        where("role", "==", "admin"),
        where("isActive", "==", true),
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false,
  });

export const useActiveTeachers = () =>
  useQuery({
    queryKey: ["usersActiveTeachers"],
    queryFn: async () => {
      const q = query(
        collection(firestore, "users"),
        where("role", "==", "teacher"),
        where("isActive", "==", true),
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false,
  });

export const useCoursesCount = () =>
  useQuery({
    queryKey: ["coursesCount"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(firestore, "courses"));
      return snapshot.size;
    },
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false,
  });

export const useClassesCount = () =>
  useQuery({
    queryKey: ["classesCount"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(firestore, "classes"));
      return snapshot.size;
    },
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false,
  });

export const useApprovedEnrollments = () =>
  useQuery({
    queryKey: ["enrollmentsApproved"],
    queryFn: async () => {
      const q = query(
        collection(firestore, "enrollments"),
        where("status", "==", "approved"),
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false,
  });
