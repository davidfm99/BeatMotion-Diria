import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import useUserStore from "@/store/useUserStore";

export default function HomeScreen() {
  const { role } = useUserStore();

  const goToProfile = () => {
    router.push("/private/profile");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-black px-6 py-12 justify-center">
        <Text className="text-3xl font-extrabold text-white mb-2">
          Beatmotion Diria
        </Text>
        <Text className="text-base text-gray-300 mb-8">
          Tu espacio de baile. Explora clases, horarios y tu perfil.
        </Text>

        {role && (
          <Text className="text-sm text-indigo-300 italic mb-8">
            Tu rol actual es: {role}
          </Text>
        )}

        {/* Bottom bar */}
        <View className="absolute left-0 right-0 bottom-0 bg-gray-900 h-24 flex-row items-center px-6 gap-6">
          {role === "admin" && (
            <>
              <View className="flex-1 items-center">
                <TouchableOpacity
                  onPress={() => router.push("/private/admin/users")}
                  className="w-12 h-12 rounded-full bg-yellow-400 items-center justify-center"
                  accessibilityLabel="Gestión de usuarios"
                >
                  <Ionicons name="people-outline" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xs text-white mt-2">Usuarios</Text>
              </View>

              <View className="flex-1 items-center">
                <TouchableOpacity
                  onPress={() => router.push("/private/admin/coursesMenu" as any)}
                  className="w-12 h-12 rounded-full bg-yellow-400 items-center justify-center"
                  accessibilityLabel="Gestión de cursos"
                >
                  <Ionicons name="book-outline" size={24} color="black" />
                </TouchableOpacity>

                <Text className="text-xs text-white mt-2">Cursos</Text>
              </View>
            </>
          )}

          <View className="flex-1 items-center">
            <TouchableOpacity
              onPress={goToProfile}
              className="w-12 h-12 rounded-full bg-white items-center justify-center"
              accessibilityLabel="Ir a mi perfil"
            >
              <Ionicons name="person-circle-outline" size={26} />
            </TouchableOpacity>
            <Text className="text-xs text-white mt-2">Ver Perfil</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
