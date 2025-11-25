import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AttendanceSchemaArray } from "./schema";

export const useAttendanceByUser = (userId: string, courseId?: string) => {
  const getAttendance = async () => {
    try {
      if (userId === "") return [];
      const ref = courseId
        ? query(
            collection(firestore, "attendance"),
            where("userId", "==", userId),
            where("courseId", "==", courseId)
          )
        : query(
            collection(firestore, "attendance"),
            where("userId", "==", userId)
          );
      const snapshots = await getDocs(ref);
      const attendance = snapshots.docs.map((snap) => ({
        id: snap.id,
        ...snap.data(),
      }));
      return AttendanceSchemaArray.parse(attendance);
    } catch (error: any) {
      console.error("Error in UseAttendanceByUser", error.message);
    }
  };
  const attendanceQuery = useQuery({
    queryKey: ["attendanceByUser", userId],
    queryFn: getAttendance,
    enabled: !!userId,
  });

  return attendanceQuery;
};
