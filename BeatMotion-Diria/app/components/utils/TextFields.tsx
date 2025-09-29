import { View, TextInput, Text } from "react-native";

type TextFieldsProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
};

const TextFields = ({ label, value, onChangeText }: TextFieldsProps) => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="mb-2">{label}</Text>
      <TextInput
        className="border border-gray-300 p-2 rounded w-full mb-4"
        placeholder="Enter text"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};
export default TextFields;
