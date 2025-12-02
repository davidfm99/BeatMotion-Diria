import { firestore } from "@/firebaseConfig";
import { doc, getDoc, onSnapshot } from "@firebase/firestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Alert } from "react-native";
import { userSchema } from "./userSchema";

const fetchUser = async (userid: string) => {
  try {
    const ref = doc(firestore, "users", userid);
    const snapshot = await getDoc(ref);
    const user = {
      id: snapshot.id,
      ...snapshot.data(),
    };
    return userSchema.parse(user);
  } catch (err) {
    console.error("Error loading user:", err);
    Alert.alert("Error", "No se pudo cargar el usuario.");
  }
};

export const useUserInfo = (userid: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user", userid],
    queryFn: () => fetchUser(userid),
    enabled: !!userid,
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(firestore, "users", userid), (snapshot) => {
      queryClient.setQueryData(["user", userid], {
        id: snapshot.id,
        ...snapshot.data(),
      });
    });
    return () => unsub();
  }, [queryClient, userid]);

  return query;
};
