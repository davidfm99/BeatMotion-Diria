import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useUsers } from "../user/useUsers";
import { membersByCourseSchema } from "./schema";

export const useMembersByCourse = (courseId: string) => {
  const users = useUsers();
  const getCourseMembers = async () => {
    try {
      const queryRef = query(
        collection(firestore, "courseMember"),
        where("courseId", "==", courseId)
      );
      const snapshots = await getDocs(queryRef);
      const userList = users.data || [];
      const members = snapshots.docs.map((snap) => ({
        id: snap.id,
        ...snap.data(),
        userInfo: userList.find((user) => user.id === snap.data().userId),
      }));
      return membersByCourseSchema.parse(members);
    } catch (error) {
      console.error("Error in useMembersByCourse", error);
    }
  };

  const memberQuery = useQuery({
    queryKey: ["membersByCourse", courseId],
    queryFn: getCourseMembers,
    enabled: !!courseId,
  });

  return memberQuery;
};
