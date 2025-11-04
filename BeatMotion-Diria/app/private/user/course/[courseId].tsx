import DataLoader from "@/components/DataLoader";
import { getEnrollmentColor, statusTranslations } from "@/constants/helpers";
import { useCourseDetail } from "@/hooks/courses/useCourseDetail";
import { useActiveUser } from "@/hooks/UseActiveUser";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CourseDetail = () => {
  const { courseId } = useLocalSearchParams();
  const { user: activeUser } = useActiveUser();
  const courseDetailQuery = useCourseDetail(
    activeUser?.uid || "",
    courseId as string
  );

  return (
    <SafeAreaView className="bg-gray-950 h-full p-5">
      <DataLoader
        query={courseDetailQuery}
        emptyMessage="Error al cargar detalles del curso. Por Favor, intentelo de nuevo"
      >
        {(course) => (
          <View className="flex-col gap-2">
            <Text className="text-white text-3xl font-bold mb-2">
              {course?.title}
            </Text>
            <Text className="text-white text-lg mb-2">
              {course?.description}
            </Text>
            <Text className="text-gray-400 text-lg">
              Día del curso: {course?.day}
            </Text>
            <Text className="text-gray-400 text-lg">
              Nivel del curso: {course?.level}
            </Text>
            <Text className="text-gray-400 text-lg">
              Instructor : {course?.teacher}
            </Text>
            {course?.paymentStatus && (
              <Text className="text-gray-400 text-lg">
                Estado de Pago:{" "}
                <Text
                  className={`text-lg font-bold ${getEnrollmentColor(
                    course?.paymentStatus
                  )}`}
                >
                  {statusTranslations[course?.paymentStatus]}
                </Text>
              </Text>
            )}
            <Text className="text-gray-400 text-lg">
              Fecha de próximo pago:{" "}
              <Text className="text-yellow-400">
                {course?.nextPaymentDate
                  ? new Date(course?.nextPaymentDate).toLocaleDateString()
                  : "N/A"}
              </Text>
            </Text>
            <Text className="text-gray-400 text-lg">
              conteo de asistencias:{" "}
              <Text className="text-yellow-400">
                {course?.attendanceCount || 0}
              </Text>
            </Text>
            <Text className="text-primary text-lg mt-10 font-bold">
              Aqui más abajo irán los detalles del curso...
            </Text>
          </View>
        )}
      </DataLoader>
    </SafeAreaView>
  );
};
export default CourseDetail;
