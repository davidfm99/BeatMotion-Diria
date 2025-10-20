import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";

export default function CoursesMenuScreen() {
  useEffect(() => {
    console.log("CoursesMenuScreen mounted");
  }, []);

  return (
    <View className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">
        Gestión de cursos y clases
      </Text>

      <View className="gap-3">
        <TouchableOpacity
          className="bg-white rounded-2xl px-5 py-4"
          onPress={() => router.push("/private/admin/courses/list")}
        >
          <Text className="text-center font-semibold">Ver Curso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-2xl px-5 py-4"
          onPress={() => router.push("/private/admin/courses/new")}
        >
          <Text className="text-center font-semibold">Crear Curso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-2xl px-5 py-4"
          onPress={() => router.push("/private/admin/classes/list")}
        >
          <Text className="text-center font-semibold">Ver Clases</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-2xl px-5 py-4"
          onPress={() => router.push("/private/admin/classes/new")}
        >
          <Text className="text-center font-semibold">Crear Clase</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
