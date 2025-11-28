import MenuButton from "@/components/MenuButton";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { JSX } from "react";
import { ScrollView, Text, TouchableHighlight, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MyCourses from "./myCourses";

type MenuProps = {
  icon: JSX.Element;
  label: string;
  route: string;
};
const MENU: MenuProps[] = [
  {
    icon: <FontAwesome5 name="money-check" size={36} color="turquoise" />,
    label: "Centro de pagos",
    route: "/private/user/payment/paymentCenter",
  },
  {
    icon: (
      <MaterialCommunityIcons
        name="clipboard-check-outline"
        size={44}
        color="turquoise"
      />
    ),
    label: "Encuesta",
    route: "/private/user/payment/paymentCenter",
  },
  {
    icon: <Icon name="bag-outline" size={44} color="turquoise" />,
    label: "Gestionar tienda",
    route: "/private/marketplace/MarketplaceList",
  },
];

const HomeUser = () => {
  const router = useRouter();

  const handleClickEnroll = () => {
    router.push("/private/user/enrollment/createEnrollment");
  };

  const handleGoToRoute = (uri: string) => {
    router.push(uri as Href);
  };

  return (
    <View>
      <TouchableHighlight
        className="bg-primary self-end text-gray-950 w-1/2 rounded-full px-3 py-3  justify-center active:opacity-80 mb-8 flex-row gap-2 items-center"
        onPress={handleClickEnroll}
      >
        <>
          <Icon name="add-circle-outline" size={20} />
          <Text className="text-darkText gap-2 font-bold">
            Matricular Curso
          </Text>
        </>
      </TouchableHighlight>

      <MyCourses />
      <ScrollView className="h-96">
        <View className="flex-row flex-wrap mt-3">
          {MENU.map((item: MenuProps) => (
            <View key={item.label} className="w-1/2 p-2">
              <MenuButton
                {...item}
                onPress={() => handleGoToRoute(item.route)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeUser;
