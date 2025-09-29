import { TouchableOpacity, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
};

const Button = ({ title, onPress }: ButtonProps) => {
  return (
    <TouchableOpacity
      className="bg-blue-500 p-4 rounded text-center"
      onPress={onPress}
    >
      <Text className="text-white">{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
