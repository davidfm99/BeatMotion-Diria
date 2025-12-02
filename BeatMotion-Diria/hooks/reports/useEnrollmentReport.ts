import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { EnrollmentReport } from "./schema";

const getMonthName = (date: Date): string => {
  return date.toLocaleDateString("es-CR", { month: "short", year: "numeric" });
};

export const useEnrollmentReport = () => {
  const fetchEnrollmentReport = async (): Promise<EnrollmentReport> => {
    try {
      // Fetch enrollments
      const enrollmentSnapshot = await getDocs(
        collection(firestore, "enrollments")
      );
      const enrollments = enrollmentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Fetch courses for names
      const coursesSnapshot = await getDocs(collection(firestore, "courses"));
      const courses = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const totalEnrollments = enrollments.length;
      const approvedEnrollments = enrollments.filter(
        (e) => e.status === "approved"
      ).length;
      const pendingEnrollments = enrollments.filter(
        (e) => e.status === "pending"
      ).length;
      const rejectedEnrollments = enrollments.filter(
        (e) => e.status === "rejected"
      ).length;

      // Group by course
      const courseEnrollments: Record<
        string,
        { count: number; approvedCount: number }
      > = {};

      enrollments.forEach((enrollment) => {
        const courseId = enrollment.courseId;
        if (!courseEnrollments[courseId]) {
          courseEnrollments[courseId] = { count: 0, approvedCount: 0 };
        }
        courseEnrollments[courseId].count += 1;
        if (enrollment.status === "approved") {
          courseEnrollments[courseId].approvedCount += 1;
        }
      });

      const enrollmentsByCourse = Object.entries(courseEnrollments).map(
        ([courseId, data]) => {
          const course = courses.find((c) => c.id === courseId);
          return {
            courseId,
            courseName: course?.title || "Curso desconocido",
            count: data.count,
            approvedCount: data.approvedCount,
          };
        }
      );

      // Group by month
      const monthlyData: Record<string, number> = {};
      enrollments.forEach((enrollment) => {
        const submittedAt = enrollment.submittedAt?.toDate?.() || new Date();
        const monthKey = getMonthName(submittedAt);
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += 1;
      });

      const enrollmentsByMonth = Object.entries(monthlyData)
        .map(([month, count]) => ({
          month,
          count,
        }))
        .slice(-6); // Last 6 months

      return {
        totalEnrollments,
        approvedEnrollments,
        pendingEnrollments,
        rejectedEnrollments,
        enrollmentsByCourse,
        enrollmentsByMonth,
      };
    } catch (error: any) {
      console.error("Error fetching enrollment report:", error.message);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["reportsPayments"],
    queryFn: fetchEnrollmentReport,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
