import { AntDesign } from "@expo/vector-icons";
import { Image, Modal, Pressable, View } from "react-native";

type ImageModalProps = {
  isVisible: boolean;
  imageSelected: string;
  toggleVisibility: () => void;
};
const ImageModal = ({
  isVisible,
  imageSelected,
  toggleVisibility,
}: ImageModalProps) => {
  return (
    <Modal animationType="slide" transparent visible={isVisible}>
      <View className="bg-black flex-1 justify-center items-center">
        <Pressable
          onPress={toggleVisibility}
          className="mt-10 rounded-full p-2 z-10 bg-gray-800 absolute top-20 right-4"
        >
          <AntDesign name="close" className="mt-2" size={24} color="white" />
        </Pressable>
        <Image
          source={{ uri: imageSelected || "" }}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
    </Modal>
  );
};

export default ImageModal;
