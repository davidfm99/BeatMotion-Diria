import { View, Text, TouchableHighlight } from "react-native";
import { useEnrollments } from "@/hooks/enrollment/useEnrrollments";
import DataLoader from "@/components/DataLoader";
import { statusTranslations, getEnrollmentColor } from "@/constants/helpers";
import { useRouter } from "expo-router";

const EnrollmentAvailable = () => {
  const enrollmentQuery = useEnrollments();
  const router = useRouter();

  const handleViewMoreEnrolls = () => {
    router.push("/private/admin/enrollmentList");
  };

  return (
    <View>
      <View className="flex-row justify-between">
        <Text className="text-white text-2xl font- w-auto font-extrabold">
          Matriculas pendientes
        </Text>
        <TouchableHighlight
          className="rounded-full px-3 py-3 self-end justify-center active:opacity-80 mb-5 flex-row gap-2 items-center"
          onPress={handleViewMoreEnrolls}
        >
          <>
            <Text className="text-primary gap-2 font-bold">Ver más</Text>
          </>
        </TouchableHighlight>
      </View>
      <View className="border rounded-md bg-slate-700 p-4">
        <DataLoader
          query={enrollmentQuery}
          emptyMessage="No existen matriculas pendientes"
        >
          {(data) =>
            data
              .filter((_, index) => index < 2)
              .map((enrollment) => (
                <View
                  key={enrollment.id}
                  className="border-b border-gray-600 py-2"
                >
                  <Text className="text-white text-xl font-bold">
                    {enrollment?.course?.title}
                  </Text>
                  <Text className="text-white">
                    Estado:{" "}
                    <Text className={getEnrollmentColor(enrollment.status)}>
                      {statusTranslations[enrollment.status]}
                    </Text>
                  </Text>
                  <Text className="text-gray-400">
                    Monto total: ₡{enrollment.totalAmount}
                  </Text>
                  <Text className="text-gray-400">
                    Fecha de solicitud:{" "}
                    {new Date(enrollment.submittedAt).toLocaleDateString()}
                  </Text>
                  <Text className="text-gray-400">
                    Estudiante: {enrollment?.user?.firstName}{" "}
                    {enrollment?.user?.lastName}
                  </Text>
                </View>
              ))
          }
        </DataLoader>
      </View>
    </View>
  );
};

export default EnrollmentAvailable;
