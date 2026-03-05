import { firestore } from "@/firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useAssignClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enrollmentId,
      classId,
      adminId,
    }: {
      enrollmentId: string;
      classId: string;
      adminId: string;
    }) => {
      const ref = doc(firestore, "enrollments", enrollmentId);

      await updateDoc(ref, {
        assignedClass: classId,
        classAssignedAt: serverTimestamp(),
        classAssignedBy: adminId,
      });
    },

    onSuccess: () => {
      Alert.alert("Éxito", "Clase asignada correctamente");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },

    onError: (err) => {
      console.error("Error al asignar la clase:", err);
      Alert.alert("Error", "No se pudo asignar la clase");
    },
  });
  
};