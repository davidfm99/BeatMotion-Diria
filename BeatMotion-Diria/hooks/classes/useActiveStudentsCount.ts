import { useQuery } from "@tanstack/react-query";
import { firestore } from "@/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export const useActiveStudentsCount = () =>
  useQuery({
    queryKey: ["users", "activeStudents"],
    queryFn: async () => {
      const q = query(
        collection(firestore, "users"),
        where("role", "==", "student"),
        where("active", "==", true) //
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
    staleTime: 1000 * 60, // 1 minuto
  });