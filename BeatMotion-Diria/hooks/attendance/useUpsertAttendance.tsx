import { firestore } from "@/firebaseConfig";
import { useMutation } from "@tanstack/react-query";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { Alert } from "react-native";
import { AttendanceType } from "./schema";

const updateAttendance = async (attendance: AttendanceType[]) => {
  try {
    const batch = writeBatch(firestore);

    attendance.forEach((att) => {
      const ref = doc(firestore, "attendance", `${att.classId}_${att.userId}`);
      const isNew = !att.createdAt;
      const data = {
        ...att,
        updatedAt: serverTimestamp(),
      };
      if (isNew) {
        data.createdAt = serverTimestamp();
      }

      batch.set(ref, data, { merge: true });
    });

    await batch.commit();
    Alert.alert("Éxito", "Asistencias guardadas exitosamente");
  } catch (error: any) {
    console.error("Error in useUpdateAttendance", error.message);
    Alert.alert(
      "Error",
      "Asistencia no ha sido guardada. Intente de nuevo, por favor"
    );
  }
};

export const useUpsertAttendance = () => {
  const mutation = useMutation({
    mutationFn: updateAttendance,
  });

  return mutation;
};
