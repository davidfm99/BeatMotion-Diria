import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

const BackButton = () => {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} className="p-2">
      <Ionicons name="chevron-back" size={24} color="white" />
    </TouchableOpacity>
  );
};
export default BackButton;
