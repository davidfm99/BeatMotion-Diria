import { JSX } from "react";
import { Pressable, Text } from "react-native";

type MenuButtonProps = {
  icon: JSX.Element;
  label: string;
  onPress: () => void;
};

const MenuButton = ({ icon, label, onPress }: MenuButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-col justify-center items-center p-4 h-36  rounded-lg bg-gray-900 active:bg-primary active:text-white"
    >
      {icon}
      <Text className="font-bold text-center text-white mt-2">{label}</Text>
    </Pressable>
  );
};

export default MenuButton;
