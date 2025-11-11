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

  return (
    <View>
      <TouchableHighlight
        className="bg-secondary self-end text-white w-1/2 rounded-full px-3 py-3  justify-center active:opacity-80 mb-8 flex-row gap-2 items-center"
        onPress={handleClickEnroll}
      >
        <>
          <Icon name="add-circle-outline" size={20} />
          <Text className="text-white gap-2 font-bold">Matricular Curso</Text>
        </>
      </TouchableHighlight>
      <TouchableHighlight
        className="bg-yellow-400 self-end text-white w-1/2 rounded-full px-3 py-3 justify-center active:opacity-80 mb-8 flex-row gap-2 items-center"
        onPress={handleOpenMarketplace}
      >
        <>
          <Icon name="bag-outline" size={20} color="black" />
          <Text className="text-black gap-2 font-bold">Ver Tienda</Text>
        </>
      </TouchableHighlight>
      <MyCourses />
    </View>
  );
};

export default HomeUser;
