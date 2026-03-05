import { firestore } from "@/firebaseConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { Alert } from "react-native";

export const useMarkNotificationAsSeen = (uid?  : string) => {
  const queryClient = useQueryClient();
  const markNotificationAsSeen = async (notificationId: string) => {
    try {
      const ref = doc(firestore, "notifications", notificationId);
      await updateDoc(ref, {
        read: true,
      });
    } catch (err) {
      Alert.alert("Error", "Error al marcar la notificación como vista");
      console.error("Error en useMarkNotificationAsSeen", err);
    }
  };

  const mutation = useMutation({
    mutationFn: markNotificationAsSeen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myNotifications", uid] });
    },
  });

  return mutation;
};
