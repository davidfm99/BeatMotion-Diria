import { firestore } from "@/firebaseConfig";
import { useMutation } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { Alert } from "react-native";
import { RequestSchema } from "./notificationSchemas";

const updateDraft = async ({
  id,
  body,
}: {
  id: string;
  body: RequestSchema;
}) => {
  try {
    const draftRef = doc(firestore, "drafts", id);
    await updateDoc(draftRef, body);
    Alert.alert("Borrador guardado correctamente.");
  } catch (err) {
    console.error("Error in draft update", err);
    Alert.alert("Error al guardar. Intentelo de nuevo.");
  }
};

export const useUpdateDraft = () => {
  const mutation = useMutation({
    mutationFn: updateDraft,
  });
  return mutation;
};
