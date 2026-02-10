import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { JSX } from "react";
import { ScrollView, View } from "react-native";
import CoursesMenuScreen from "../admin/coursesMenu";

type MenuProps = {
  icon: JSX.Element;
  label: string;
  route: string;
};

const HomeTeacher = () => {
  const router = useRouter();

  const handleGoToRoute = (route: string) => {
    router.push(route as Href);
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <CoursesMenuScreen />
      </ScrollView>
    </View>
  );
};

export default HomeTeacher;
