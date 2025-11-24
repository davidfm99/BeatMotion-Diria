import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Text, TouchableHighlight, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MyCourses from "./myCourses";

const HomeUser = () => {
  const router = useRouter();

  const handleClickEnroll = () => {
    router.push("/private/user/enrollment/createEnrollment");
  };

  const handleOpenMarketplace = () => {
    router.push("/private/marketplace/MarketplaceList" as Href);
  };

  const handleOpenEvents = () => {
    router.push("/private/user/events" as Href);
  };

  return (
    <View>
      <TouchableHighlight
        className="bg-primary self-end text-gray-950 w-1/2 rounded-full px-3 py-3 justify-center active:opacity-80 mb-8"
        onPress={handleClickEnroll}
      >
        <View className="flex-row gap-2 items-center justify-center">
          <Icon name="add-circle-outline" size={20} />
          <Text className="text-white gap-2 font-bold">Matricular Curso</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        className="bg-yellow-400 self-end text-white w-1/2 rounded-full px-3 py-3 justify-center active:opacity-80 mb-8"
        onPress={handleOpenMarketplace}
      >
        <View className="flex-row gap-2 items-center justify-center">
          <Icon name="bag-outline" size={20} color="black" />
          <Text className="text-black gap-2 font-bold">Ver Tienda</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        className="bg-blue-500 self-end text-white w-1/2 rounded-full px-3 py-3 justify-center active:opacity-80 mb-8"
        onPress={handleOpenEvents}
      >
        <View className="flex-row gap-2 items-center justify-center">
          <Icon name="calendar-outline" size={20} color="white" />
          <Text className="text-white gap-2 font-bold">Eventos</Text>
        </View>
      </TouchableHighlight>
      <MyCourses />
    </View>
  );
};

export default HomeUser;
