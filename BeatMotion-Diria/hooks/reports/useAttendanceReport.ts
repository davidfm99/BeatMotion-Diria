import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { AttendanceReport } from "./schema";

export const useAttendanceReport = () => {
  const fetchAttendanceReport = async (): Promise<AttendanceReport> => {
    try {
      // Fetch attendance records
      const attendanceSnapshot = await getDocs(
        collection(firestore, "attendance")
      );
      const attendanceRecords = attendanceSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Fetch classes
      const classesSnapshot = await getDocs(collection(firestore, "classes"));
      const classes = classesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Fetch courses for names
      const coursesSnapshot = await getDocs(collection(firestore, "courses"));
      const courses = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const totalClasses = classes.length;
      const totalAttendanceRecords = attendanceRecords.length;
      const attendedCount = attendanceRecords.filter(
        (a) => a.attended === true
      ).length;
      const absentCount = totalAttendanceRecords - attendedCount;
      const attendanceRate =
        totalAttendanceRecords > 0
          ? Math.round((attendedCount / totalAttendanceRecords) * 100)
          : 0;

      // Group by course
      const courseAttendance: Record<
        string,
        { totalClasses: number; totalAttendance: number; attended: number }
      > = {};

      classes.forEach((cls) => {
        const courseId = cls.courseId;
        if (!courseAttendance[courseId]) {
          courseAttendance[courseId] = {
            totalClasses: 0,
            totalAttendance: 0,
            attended: 0,
          };
        }
        courseAttendance[courseId].totalClasses += 1;
      });

      attendanceRecords.forEach((record) => {
        const courseId = record.courseId;
        if (courseAttendance[courseId]) {
          courseAttendance[courseId].totalAttendance += 1;
          if (record.attended) {
            courseAttendance[courseId].attended += 1;
          }
        }
      });

      const attendanceByCourse = Object.entries(courseAttendance).map(
        ([courseId, data]) => {
          const course = courses.find((c) => c.id === courseId);
          return {
            courseId,
            courseName: course?.title || "Curso desconocido",
            totalClasses: data.totalClasses,
            totalAttendance: data.totalAttendance,
            attendanceRate:
              data.totalAttendance > 0
                ? Math.round((data.attended / data.totalAttendance) * 100)
                : 0,
          };
        }
      );

      return {
        totalClasses,
        totalAttendanceRecords,
        attendedCount,
        absentCount,
        attendanceRate,
        attendanceByCourse,
      };
    } catch (error: any) {
      console.error("Error fetching attendance report:", error.message);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["attendanceReport"],
    queryFn: fetchAttendanceReport,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
