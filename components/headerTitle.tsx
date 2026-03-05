import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type headerProps = {
  title: string;
  subtitle?: string;
};

const HeaderTitle = ({ title, subtitle }: headerProps) => {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-2 p-4 mb-2">
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-2 rounded-full bg-gray-800"
      >
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>
      <View>
        <Text className="text-white text-2xl font-bold">{title}</Text>
        {subtitle && <Text className="text-gray-400">{subtitle}</Text>}
      </View>
    </View>
  );
};
export default HeaderTitle;
