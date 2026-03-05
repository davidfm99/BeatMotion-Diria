import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function AssignClassPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-gray-900">
      <Text className="text-white text-xl font-bold">Asignar Clase</Text>
      <Text className="text-gray-400 mt-2">ID recibido: {id}</Text>
    </View>
  );
}