import { firestore } from "@/firebaseConfig";
import { useMutation } from "@tanstack/react-query";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { Alert } from "react-native";
import { PaymentCreatePayload } from "./schema";

const postPayment = async (payload: PaymentCreatePayload) => {
  try {
    const ref = doc(collection(firestore, "payments"));
    await setDoc(ref, {
      ...payload,
      createdAt: Timestamp.now(),
    });
    Alert.alert("Éxito", "El pago se ha enviado exitosamente.");
  } catch (error: any) {
    console.error("Error CreatePayment", error.message);
    Alert.alert(
      "Error",
      "El pago no ha podido ser enviado. Intente de nuevo por favor."
    );
  }
};

export const useCreatePayment = () => {
  const mutation = useMutation({
    mutationFn: postPayment,
  });
  return mutation;
};
