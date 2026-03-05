import { firestore } from "@/firebaseConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Alert } from "react-native";

type MarkPayload = {
  paymentId: string;
  status: "approved" | "rejected";
  reviewedBy: string | null;
};
const markPayment = async ({ paymentId, status, reviewedBy }: MarkPayload) => {
  try {
    await updateDoc(doc(firestore, "payments", paymentId), {
      status,
      reviewedBy,
      reviewedAt: serverTimestamp(),
    });
    Alert.alert("Éxito", "El pago ha sido actualizado con éxito");
  } catch (error: any) {
    console.error("Error Mark payment", error.message);
    Alert.alert(
      "Error",
      "Ha occurrido un error en la actualización del pago, intentelo de nuevo por favor"
    );
  }
};

export const useMarkPayment = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: markPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "pending"] });
    },
  });
  return mutation;
};
