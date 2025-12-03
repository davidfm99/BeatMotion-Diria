import { firestore } from "@/firebaseConfig";
import { collection, getDocs, onSnapshot } from "@firebase/firestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Alert } from "react-native";
import { userListSchema } from "./userSchema";

const fetchUsers = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, "users"));
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return userListSchema.parse(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    Alert.alert("Error", "No se pudieron obtener los usuarios.");
  }
};

export const useUsers = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
  });

  //Will do updates in real time
  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "users"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      queryClient.setQueryData(["users"], data);
    });
    return () => unsub();
  }, [queryClient]);

  return query;
};
