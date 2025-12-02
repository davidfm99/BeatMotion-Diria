import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { PaymentReport } from "./schema";

const getMonthName = (date: Date): string => {
  return date.toLocaleDateString("es-CR", { month: "short", year: "numeric" });
};

export const usePaymentReport = () => {
  const fetchPaymentReport = async (): Promise<PaymentReport> => {
    try {
      const snapshot = await getDocs(collection(firestore, "payments"));
      const payments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const totalPayments = payments.length;
      const approvedPayments = payments.filter(
        (p) => p.status === "approved"
      ).length;
      const pendingPayments = payments.filter(
        (p) => p.status === "pending"
      ).length;
      const rejectedPayments = payments.filter(
        (p) => p.status === "rejected"
      ).length;

      const approvedPaymentsList = payments.filter(
        (p) => p.status === "approved"
      );
      const totalRevenue = approvedPaymentsList.reduce(
        (sum, p) => sum + (p.totalAmount || 0),
        0
      );

      const latePayments = payments.filter((p) => p.isLatePayment === true);
      const latePaymentsCount = latePayments.length;
      const latePaymentsRevenue = latePayments.reduce(
        (sum, p) => sum + (p.lateFare || 0),
        0
      );

      // Group by month
      const monthlyData: Record<string, { count: number; amount: number }> = {};
      approvedPaymentsList.forEach((payment) => {
        const createdAt = payment.createdAt?.toDate?.() || new Date();
        const monthKey = getMonthName(createdAt);
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { count: 0, amount: 0 };
        }
        monthlyData[monthKey].count += 1;
        monthlyData[monthKey].amount += payment.totalAmount || 0;
      });

      const paymentsByMonth = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          count: data.count,
          amount: data.amount,
        }))
        .slice(-6); // Last 6 months

      return {
        totalPayments,
        approvedPayments,
        pendingPayments,
        rejectedPayments,
        totalRevenue,
        latePaymentsCount,
        latePaymentsRevenue,
        paymentsByMonth,
      };
    } catch (error: any) {
      console.error("Error fetching payment report:", error.message);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["reports", "payments"],
    queryFn: fetchPaymentReport,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
