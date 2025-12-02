import { firestore } from "@/firebaseConfig";
import { useMutation } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { Alert } from "react-native";
import { ProfilePayload } from "./userSchema";

const updateProfile = async ({ uid, body }: ProfilePayload) => {
  try {
    await updateDoc(doc(firestore, "users", uid || ""), body);

    Alert.alert("Perfil", "Perfil actualizado correctamente.");
  } catch (err) {
    console.error("Error saving profile:", err);
    Alert.alert("Error", "No se pudo actualizar el perfil.");
  }
};

export const useUpdateProfile = () => {
  const mutation = useMutation({
    mutationFn: updateProfile,
  });
  return mutation;
};
