import MenuButton from "@/components/MenuButton";
import {
  AntDesign,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
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
    icon: <FontAwesome5 name="money-check" size={34} color="turquoise" />,
    label: "Administrar cobros",
    route: "/private/admin/payment/paymentCenter",
  },
  {
    icon: <Ionicons name="people-outline" size={34} color="turquoise" />,
    label: "Usuarios",
    route: "/private/admin/users",
  },
  {
    icon: <Ionicons name="book-outline" size={40} color="turquoise" />,
    label: "Cursos",
    route: "/private/admin/coursesMenu",
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
    icon: <MaterialIcons name="event" size={44} color="turquoise" />,
    label: "Eventos",
    route: "/private/admin/events",
  },
  {
    icon: <AntDesign name="notification" size={34} color="turquoise" />,
    label: "Centro notificaciones",
    route: "/private/admin/notifications/notificationCenter",
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
  {
    icon: <Ionicons name="document-text-outline" size={44} color="turquoise" />,
    label: "Reportes",
    route: "/private/admin/reports",
  },
];

const HomeAdmin = () => {
  const router = useRouter();

  const handleGoToRoute = (route: string) => {
    router.push(route as Href);
  };

  return (
    <View className="gap-6 flex-1">
      <EnrollmentAvailable />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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
