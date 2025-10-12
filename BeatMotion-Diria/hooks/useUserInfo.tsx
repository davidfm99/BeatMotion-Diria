import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { firestore } from "@/firebaseConfig";
import { collection, doc, getDoc, onSnapshot } from "@firebase/firestore";
import { Alert } from "react-native";
import zod from "zod";

const userSchema = zod.object({
  id: zod.string().uuid(),
  email: zod.string().email(),
  name: zod.string().min(2).max(100),
  lastName: zod.string().min(2).max(100),
  phone: zod.string().min(10).max(15),
  role: zod.enum(["user", "admin", "teacher"]),
  photoURL: zod.string().url().optional(),
  active: zod.boolean(),
});

const fetchUser = async (userid: string) => {
  try {
    const ref = doc(firestore, "users", userid);
    const snapshot = await getDoc(ref);
    return userSchema.parse(snapshot.data());
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
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "users"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      queryClient.setQueryData(["users"], data);
    });
    return () => unsub();
  }, [queryClient]);

  return query;
};
