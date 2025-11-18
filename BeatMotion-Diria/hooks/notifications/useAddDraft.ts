import { firestore } from "@/firebaseConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection } from "firebase/firestore";
import { Alert } from "react-native";
import { RequestSchema } from "./notificationSchemas";

const createDraft = async (d: RequestSchema) => {
  if (d.recipients?.length === 0) {
    Alert.alert("Error", "Selecciona al menos un destinatario.");
    return;
  }

  try {
    await addDoc(collection(firestore, "drafts"), {
      ...d,
      createdAt: new Date().toISOString(),
    });

    Alert.alert("Éxito", "Borrador ha sido guardado correctamente.");
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "No se pudo enviar el comunicado, intentar de nuevo.");
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
