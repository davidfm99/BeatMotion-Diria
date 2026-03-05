import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/firebaseConfig";

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

export const uploadImage = async (
  uri: string,
  userId: string
): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();

  const fileRef = ref(storage, `${userId}/${Date.now()}.jpg`);
  await uploadBytes(fileRef, blob);

  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
};

