import MenuButton from "@/components/MenuButton";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { JSX } from "react";
import { ScrollView, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import EnrollmentAvailable from "../admin/enrollmentsAvailable";

type MenuProps = {
  icon: JSX.Element;
  label: string;
  route: string;
};
const MENU: MenuProps[] = [
  {
    icon: <FontAwesome5 name="money-check" size={36} color="turquoise" />,
    label: "Administrar cobros",
    route: "/private/admin/payment/paymentCenter",
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
  {
    icon: <Icon name="analytics-outline" size={44} color="turquoise" />,
    label: "Ver estádisticas",
    route: "/private/admin/Dashboard",
  },
];

const HomeAdmin = () => {
  const router = useRouter();

  const handleGoToRoute = (route: string) => {
    router.push(route as Href);
  };

  const handleOpenEvents = () => {
    router.push("/private/admin/events" as Href);
  };

  return (
    <View className="gap-6">
      <EnrollmentAvailable />
      <ScrollView className="h-96">
        <View className="flex-row flex-wrap">
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

export default HomeAdmin;
