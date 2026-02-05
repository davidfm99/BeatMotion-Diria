import { firestore } from "@/firebaseConfig";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect } from "react";
import { Alert } from "react-native";
import { draftListSchema } from "./notificationSchemas";

export const useNotificationsHistory = () => {
  const queryClient = useQueryClient();
  const getNotificationsHistory = async () => {
    try {
      const queryRef = query(
        collection(firestore, "notificationsHistory"),
        orderBy("createdAt", "desc")
      );
      const snapshots = await getDocs(queryRef);
      const notifications = snapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("notifications", notifications);
      return draftListSchema.parse(notifications);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo cargar el historial de notificaciones.");
    }
  };

  const notificationQuery = useQuery({
    queryKey: ["notificationsHistory"],
    queryFn: getNotificationsHistory,
  });

  useEffect(() => {
    const unsub = onSnapshot(
      collection(firestore, "notificationsHistory"),
      (snapshot) => {
        const notificaciones = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        queryClient.setQueryData(["notificationsHistory"], notificaciones);
      }
    );
    return () => unsub();
  }, [queryClient]);

  return notificationQuery;
};
