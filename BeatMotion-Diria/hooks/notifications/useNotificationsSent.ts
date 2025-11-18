import { firestore } from "@/firebaseConfig";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect } from "react";
import { Alert } from "react-native";
import { draftListSchema } from "./notificationSchemas";

export const useNotificationsSentByUser = (uid: string) => {
  const queryClient = useQueryClient();
  const getNotificationsHistory = async () => {
    try {
      const ref = query(
        collection(firestore, "notificationsSent"),
        where("userId", "==", uid)
      );
      const snapshots = await getDocs(ref);
      const notifications = snapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return draftListSchema.parse(notifications);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo cargar el historial de notificaciones.");
    }
  };

  const queryFunction = useQuery({
    queryKey: ["notificationsSent", uid],
    queryFn: getNotificationsHistory,
  });

  useEffect(() => {
    const unsub = onSnapshot(
      collection(firestore, "notificationsSent"),
      (snapshot) => {
        const notificaciones = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        queryClient.setQueryData(["notificationsHistory", uid], notificaciones);
      }
    );
    return () => unsub();
  }, [queryClient, uid]);

  return queryFunction;
};
