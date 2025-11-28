import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Alert } from "react-native";
import { AttendanceSchemaArray } from "./schema";

export const useAttendanceInfo = (classId: string) => {
  const getAttendance = async () => {
    try {
      const snapshot = await getDocs(
        query(
          collection(firestore, "attendance"),
          where("classId", "==", classId)
        )
      );
      const data = snapshot.docs.map((snap) => ({
        id: snap.id,
        ...snap.data(),
      }));

      return AttendanceSchemaArray.parse(data);
    } catch (error: any) {
      Alert.alert("Error in useAttendanceInfo", error.message);
    }
  };

  const attendanceQuery = useQuery({
    queryKey: ["attendanceInfo", classId],
    queryFn: getAttendance,
  });

  return attendanceQuery;
};
