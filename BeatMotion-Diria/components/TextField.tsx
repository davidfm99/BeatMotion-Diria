import { Text, TextInput, View } from "react-native";

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
};

const TextField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
}: TextFieldProps) => {
  return (
    <View>
      <Text className="text-gray-700">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        className="border border-gray-100 p-2 rounded text-black placeholder:text-gray-400"
      />
    </View>
  );
};

export default TextField;
