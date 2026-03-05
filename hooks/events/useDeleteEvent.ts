import { firestore } from "@/firebaseConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Alert } from "react-native";

type DeleteEventInput = { id: string };

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteEventInput) => {
      if (!id) throw new Error("ID de evento faltante");
      await updateDoc(doc(firestore, "events", id), {
        isDeleted: true,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error("No se pudo eliminar el evento:", error);
      Alert.alert("Error", "No se pudo eliminar el evento.");
    },
  });
};
