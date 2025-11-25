import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/firebaseConfig";

const assertValue = <T>(value: T | null | undefined, message: string): T => {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
};

export const pickEventReceiptImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permiso necesario",
      "Necesitamos acceso a tu galería para subir el comprobante de pago."
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

  return result.assets[0].uri;
};

export const uploadEventReceiptImage = async ({
  uri,
  eventId,
  userId,
}: {
  uri: string;
  eventId: string;
  userId: string;
}) => {
  const safeUri = assertValue(uri, "missing-receipt-uri");
  const safeEventId = assertValue(eventId, "missing-event-id");
  const safeUserId = assertValue(userId, "missing-user-id");
  const safeStorage = assertValue(storage, "storage-not-initialized");

  const response = await fetch(safeUri);
  const blob = await response.blob();

  const fileRef = ref(
    safeStorage,
    `Events/EventSignUp/${safeEventId}/${safeUserId}-${Date.now()}.jpg`
  );
  await uploadBytes(fileRef, blob);

  return getDownloadURL(fileRef);
};
