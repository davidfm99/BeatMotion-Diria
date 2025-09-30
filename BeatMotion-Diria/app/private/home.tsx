import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
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
        {/* Bottom bar */}
        <View className="absolute left-0 right-0 bottom-0 bg-gray-900 h-16 flex-row items-center justify-end px-6">
          <TouchableOpacity
            onPress={goToProfile}
            className="w-12 h-12 rounded-full bg-white items-center justify-center"
            accessibilityLabel="Ir a mi perfil"
          >
            <Ionicons name="person-circle-outline" size={26} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}