import { firestore } from "@/firebaseConfig";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import { courseMemberSchema } from "./schema";

const useCourseMemberByUser = (userId: string) => {
  const getCourseMemberByUser = async () => {
    try {
      const q = query(
        collection(firestore, "courseMember"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);
      const courseMembers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return courseMemberSchema.parse(courseMembers);
    } catch (error) {
      console.error("Error fetching course member by user:", error);
      Alert.alert("Error fetching course member by user");
      throw error;
    }
  };
  return useQuery({
    queryKey: ["courseMember", userId],
    queryFn: getCourseMemberByUser,
    enabled: !!userId,
    staleTime: 1000 * 60 * 20, // 20 minutes
    refetchOnWindowFocus: false,
  });
};

export { useCourseMemberByUser };
