import { useAssignClass } from "@/hooks/classes/useAssignClass";
import { useClassesByCourse } from "@/hooks/classes/useClassesByCourse";
import { useEnrollmentsByStatus } from "@/hooks/enrollment/useEnrollmentsByStatus";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//TODO see if this component is useful or get rid of it

export default function AssignClass() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: enrollment, isLoading: loadingEnrollment } =
    useEnrollmentsByStatus("approved");
  const selectedEnrollment = enrollment?.find((e) => e.id === id);

  const { data: classes, isLoading: loadingClasses } = useClassesByCourse(
    selectedEnrollment?.courseId || ""
  );

  const assignClass = useAssignClass();

  if (loadingEnrollment || loadingClasses) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#facc15" />
        <Text className="mt-4 text-white">Cargando información...</Text>
      </View>
    );
  }

  if (!selectedEnrollment) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-lg">No se encontró la matrícula</Text>
      </View>
    );
  }

  const handleAssign = (classId: string) => {
    Alert.alert("Asignar clase", "¿Deseas asignar esta clase al estudiante?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Asignar",
        style: "default",
        onPress: () => {
          assignClass.mutate({
            enrollmentId: id!,
            classId,
            adminId: "admin123",
          });
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-900 p-4">
      {/* Información del estudiante */}
      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <Text className="text-white text-xl font-bold mb-2">👤 Estudiante</Text>
        <Text className="text-gray-300">
          {selectedEnrollment.user?.name} {selectedEnrollment.user?.lastName}
        </Text>
        <Text className="text-gray-400">{selectedEnrollment.user?.email}</Text>
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <Text className="text-white text-xl font-bold mb-2">📘 Curso</Text>
        <Text className="text-gray-300">
          {selectedEnrollment.course?.title}
        </Text>
        <Text className="text-gray-400">
          Nivel: {selectedEnrollment.course?.level}
        </Text>
      </View>

      <View className="bg-gray-800 rounded-2xl p-4">
        <Text className="text-white text-xl font-bold mb-3">
          📅 Clases disponibles
        </Text>
        {classes && classes.length > 0 ? (
          classes.map((cls: any) => (
            <View key={cls.id} className="bg-gray-700 rounded-xl p-3 mb-3">
              <Text className="text-white font-semibold">{cls.title}</Text>
              <Text className="text-gray-400">Fecha: {cls.date}</Text>
              <Text className="text-gray-400">
                Horario: {cls.startTime} - {cls.endTime}
              </Text>
              <Text className="text-gray-400">Profesor: {cls.teacherName}</Text>

              <TouchableOpacity
                className="bg-yellow-500 p-3 rounded-xl mt-3 items-center"
                onPress={() => handleAssign(cls.id)}
                disabled={assignClass.isPending}
              >
                <Text className="text-black font-semibold">
                  {assignClass.isPending
                    ? "Asignando..."
                    : "Asignar esta clase"}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text className="text-gray-400">
            No hay clases registradas para este curso.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
