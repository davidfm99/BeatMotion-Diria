import { firestore } from "@/firebaseConfig";
import { useMutation } from "@tanstack/react-query";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Alert } from "react-native";

type Videos = {
  url: string;
  platform: string;
  title: string;
};

type IncomingData = {
  title: string;
  description: string;
  content: string;
  objectives: string;
  date: string;
  startTime: string;
  endTime: string;
  videoLinks: Videos[];
  isDeleted: boolean;
};

type UpdateClassBody =
  | { id: string; patch: Partial<Omit<IncomingData, "id">> }
  | { id: string; patch: Partial<Pick<IncomingData, "isDeleted">> };

export const useUpdateClass = () => {
  const updateClass = async ({ id, patch }: UpdateClassBody) => {
    try {
      await updateDoc(doc(firestore, "classes", id), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Clase", "Actualizada correctamente.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo actualizar la clase.");
    }
  };

  const mutation = useMutation({
    mutationFn: updateClass,
  });
  return mutation;
};
