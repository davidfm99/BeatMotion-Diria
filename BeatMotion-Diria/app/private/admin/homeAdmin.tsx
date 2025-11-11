import { View, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import EnrollmentAvailable from "../admin/enrollmentsAvailable";

const HomeAdmin = () => {
  const router = useRouter();

  const handleOpenMarketplace = () => {
    router.push("/private/marketplace/MarketplaceList" as Href);
  };

  return (
    <View className="gap-6">
      <TouchableOpacity
        className="bg-yellow-400 rounded-full px-4 py-3 self-end flex-row items-center gap-2 active:opacity-80"
        onPress={handleOpenMarketplace}
      >
        <Icon name="bag-handle-outline" size={20} color="#000000" />
        <Text className="text-black font-semibold">Gestionar Tienda</Text>
      </TouchableOpacity>
      <EnrollmentAvailable />
    </View>
  );
};

export default HomeAdmin;
