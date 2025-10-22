import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { firestore } from "@/firebaseConfig";
import { collection, getDocs, onSnapshot } from "@firebase/firestore";
import { Alert } from "react-native";

const fetchUsers = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, "users"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
