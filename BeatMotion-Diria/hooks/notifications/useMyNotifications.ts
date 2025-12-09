import { firestore } from "@/firebaseConfig";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Alert } from "react-native";
import { notificationsList } from "./notificationSchemas";

export const useMyNotifications = (uid?: string) => {
  const queryClient = useQueryClient();

  const getNotificationsHistory = async () => {
    if (!uid) return [];
    try {
      const ref = query(
        collection(firestore, "notifications"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc")
      );
      const snapshots = await getDocs(ref);
      const notifications = snapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return notificationsList.parse(notifications);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudieron cargar las notificaciones.");
    }
  };

  const queryFunction = useQuery({
    queryKey: ["myNotifications", uid],
    queryFn: getNotificationsHistory,
  });

  return queryFunction;
};
