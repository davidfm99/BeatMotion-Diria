import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type HelperProp = {
  info: string;
};

const HelperInfo = ({ info }: HelperProp) => {
  const [showInfo, setShowInfo] = useState(false);
  const toggleInfoHelper = () => {
    setShowInfo((prev) => !prev);
  };
  return (
    <View className="relative justify-center ">
      <Pressable onPress={toggleInfoHelper}>
        <AntDesign name="info-circle" size={20} color="turquoise" />
      </Pressable>
      {showInfo && (
        <View className="absolute z-10 w-full -bottom-16 p-3 rounded-lg bg-gray-800">
          <Text className="text-white"> {info} </Text>
        </View>
      )}
    </View>
  );
};

export default HelperInfo;
