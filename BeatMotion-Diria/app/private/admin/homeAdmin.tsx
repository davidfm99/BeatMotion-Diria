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

  const handleOpenDashboard = () => {
    router.push("/private/admin/Dashboard" as Href); 
  };

  const handleOpenSurveys = () => {
    router.push("/private/admin/surveys/list" as Href);
  };

  return (
    <View className="gap-6">
      {/* Botón para la tienda */}
      <TouchableOpacity
        className="bg-yellow-400 rounded-full px-4 py-3 self-end flex-row items-center gap-2 active:opacity-80"
        onPress={handleOpenMarketplace}
      >
        <Icon name="bag-handle-outline" size={20} color="#000000" />
        <Text className="text-black font-semibold">Gestionar Tienda</Text>
      </TouchableOpacity>

      {/* Botón para el dashboard */}
      <TouchableOpacity
        className="bg-green-500 rounded-full px-4 py-3 self-end flex-row items-center gap-2 active:opacity-80"
        onPress={handleOpenDashboard}
      >
        <Icon name="analytics-outline" size={20} color="#FFFFFF" />
        <Text className="text-white font-semibold">Ver Dashboard</Text>
      </TouchableOpacity>

      {/* Botón para gestionar encuestas */}
      <TouchableOpacity
        className="bg-primary rounded-full px-4 py-3 self-end flex-row items-center gap-2 active:opacity-80"
        onPress={handleOpenSurveys}
      >
        <Icon name="bar-chart-outline" size={20} color="#000000" />
        <Text className="text-black font-semibold">Encuestas</Text>
      </TouchableOpacity>


      {/* Componente existente */}
      <EnrollmentAvailable />
    </View>
  );
};

export default HomeAdmin;

