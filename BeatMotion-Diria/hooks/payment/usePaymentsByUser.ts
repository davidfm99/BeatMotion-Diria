import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { PaymentSchema } from "./schema";

export const usePaymentsByUser = (userId?: string) => {
  const fetchPayment = async () => {
    if (!userId) return [];
    try {
      const qRef = query(
        collection(firestore, "payments"),
        where("userId", "==", userId)
      );
      const snapShots = await getDocs(qRef);

      const payments = snapShots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return PaymentSchema.parse(payments);
    } catch (error: any) {
      console.error("Error in UsePayment", error);
    }
  };
  const paymentQuery = useQuery({
    queryKey: ["paymentsByUser", userId],
    queryFn: fetchPayment,
  });

  return paymentQuery;
};
