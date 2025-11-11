import { firestore } from "@/firebaseConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection } from "firebase/firestore";
import { Alert } from "react-native";
import { z } from "zod";
import { draftSchema } from "./notificationSchemas";

// If you're using Zod:
type DraftInput = z.infer<typeof draftSchema>;

const createDraft = async (d: DraftInput) => {
  if (d.recipients?.length === 0) {
    Alert.alert("Error", "Selecciona al menos un destinatario.");
    return;
  }

  try {
    await addDoc(collection(firestore, "drafts"), {
      ...d,
      createdAt: new Date().toISOString(),
    });

    Alert.alert("Éxito", "Comunicado enviado a Firebase.");
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "No se pudo enviar el comunicado.");
  }
};

export const useAddDraft = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draft"] });
    },
  });

  return mutation;
};
