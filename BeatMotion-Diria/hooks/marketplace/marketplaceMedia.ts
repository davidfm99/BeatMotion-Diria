import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/firebaseConfig";

const MARKETPLACE_BUCKET = "Marketplace";

export const pickMarketplaceImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permiso necesario",
      "Necesitamos acceso a tu galeria para que puedas seleccionar imagenes del marketplace.",
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

  return result.assets[0]?.uri ?? null;
};

const buildMarketplacePath = () => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `${MARKETPLACE_BUCKET}/${timestamp}-${randomSuffix}.jpg`;
};

export const uploadMarketplaceImage = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();

  const objectPath = buildMarketplacePath();
  const fileRef = ref(storage, objectPath);
  await uploadBytes(fileRef, blob);

  return getDownloadURL(fileRef);
};
