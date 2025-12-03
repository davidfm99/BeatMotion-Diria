import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";

type DeleteEventInput = { id: string };

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteEventInput) => {
      if (!id) throw new Error("ID de evento faltante");
      await deleteDoc(doc(firestore, "events", id));
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
