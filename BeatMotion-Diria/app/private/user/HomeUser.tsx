import { TouchableHighlight, View, Text } from "react-native";
import MyCourses from "./myCourses";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

const HomeUser = () => {
  const router = useRouter();

  const handleClickEnroll = () => {
    router.push("/private/user/enrollment");
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
      <MyCourses />
    </View>
  );
};

export default HomeUser;
