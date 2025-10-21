import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const askForCameraPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permiso necesario",
      "📸 Necesitamos acceso a tu galería para que puedas subir la imagen del comprobante de pago. Este permiso solo se usa para verificar tus pagos."
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.7,
  });

  if (result.canceled) {
    return null;
  }

  const imageUri = result.assets[0].uri;
  return imageUri;
};
