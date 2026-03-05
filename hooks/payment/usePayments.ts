import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { PaymentSchema } from "./schema";

export const usePayments = (status?: "pending" | "approved" | "rejected") => {
  const fetchPayment = async () => {
    try {
      const qRef = query(
        collection(firestore, "payments"),
        where("status", "==", status),
        orderBy("createdAt", "desc")
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
    queryKey: ["payments", status],
    queryFn: fetchPayment,
  });

  return paymentQuery;
};
