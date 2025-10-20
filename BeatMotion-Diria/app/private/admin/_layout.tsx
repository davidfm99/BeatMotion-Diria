import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { View, Text } from "react-native";

export default function AdminLayout() {
  const [allowed, setAllowed] = useState<null | boolean>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setAllowed(false);
        router.replace("/public/login");
        return;
      }
      const db = getFirestore();
      const snap = await getDoc(doc(db, "users", u.uid));
      const role = snap.exists() ? (snap.data() as any).role : "user";
      const isAdmin = role === "admin";
      setAllowed(isAdmin);
      if (!isAdmin) router.replace("/private/home");
    });
    return () => unsub();
  }, []);

  if (allowed === null) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Cargando acceso...</Text>
      </View>
    );
  }

  return (
    <Stack initialRouteName="coursesMenu">
      {/* Menú principal sin colisiones */}
      <Stack.Screen name="coursesMenu" options={{ title: "Cursos" }} />

      {/* Cursos */}
      <Stack.Screen name="courses/list" options={{ title: "Ver cursos" }} />
      <Stack.Screen name="courses/new" options={{ title: "Nuevo curso" }} />
      <Stack.Screen name="courses/[id]" options={{ title: "Editar curso" }} />

      {/* Clases */}
      <Stack.Screen name="classes/list" options={{ title: "Ver clases" }} />
      <Stack.Screen name="classes/new" options={{ title: "Nueva clase" }} />
      <Stack.Screen name="classes/[id]" options={{ title: "Editar clase" }} />
    </Stack>
  );
}
