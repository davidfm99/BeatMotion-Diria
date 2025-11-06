import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { Alert } from "react-native";
import { draftListSchema } from "./notificationSchemas";

export const useDraft = () => {
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
    queryKey: ["draft"],
    queryFn: getDrafts,
  });
  
  return query;
};
