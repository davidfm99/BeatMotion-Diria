import { firestore } from "@/firebaseConfig";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { Alert } from "react-native";
import { draftListSchema } from "./notificationSchemas";

export const useDraft = () => {
  const queryClient = useQueryClient();
  const getDrafts = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, "drafts"));
      const drafts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return draftListSchema.parse(drafts);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudieron cargar los borradores.");
    }
  };

  const query = useQuery({
    queryKey: ["drafts"],
    queryFn: getDrafts,
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "drafts"), (snapshot) => {
      const drafts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      queryClient.setQueryData(["drafts"], drafts);
    });
    return () => unsub();
  }, [queryClient]);

  return query;
};
