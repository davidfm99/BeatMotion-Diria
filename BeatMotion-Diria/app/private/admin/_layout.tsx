import { Stack, router } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

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
      <Stack.Screen
        name="users"
        options={{ title: "Users", headerShown: false }}
      />
      <Stack.Screen
        name="coursesMenu"
        options={{ title: "Cursos", headerShown: false }}
      />

      {/* Cursos */}
      <Stack.Screen
        name="courses/list"
        options={{ title: "Ver cursos", headerShown: false }}
      />
      <Stack.Screen
        name="courses/new"
        options={{ title: "Nuevo curso", headerShown: false }}
      />
      <Stack.Screen
        name="courses/[id]"
        options={{ title: "Editar curso", headerShown: false }}
      />

      {/* Clases */}
      <Stack.Screen
        name="classes/list"
        options={{ title: "Ver clases", headerShown: false }}
      />
      <Stack.Screen
        name="classes/new"
        options={{ title: "Nueva clase", headerShown: false }}
      />
      <Stack.Screen
        name="classes/[id]"
        options={{ title: "Editar clase", headerShown: false }}
      />
      <Stack.Screen
        name="attendance/[courseId]/[classId]/attendance"
        options={{ headerShown: false }}
      />

      {/* Matriculas */}
      <Stack.Screen
        name="enrollments/enrollmentList"
        options={{ headerShown: false }}
      />

      {/* notification Center */}
      <Stack.Screen
        name="notifications/notificationCenter"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="notifications/[draftId]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="notifications/notificationsHistory"
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="surveys/list" 
        options={{ 
          headerShown: false,
          title: "Gestión de Encuestas" 
        }} 
      />
      {/* Encuestas*/}
      <Stack.Screen 
        name="surveys/create" 
        options={{ 
          headerShown: false,
          title: "Nueva Encuesta",
          presentation: "modal" 
        }} 
      />
      <Stack.Screen 
        name="surveys/edit/[surveyId]" 
        options={{ 
          headerShown: false,
          title: "Editar Encuesta" 
        }} 
      />
      <Stack.Screen 
        name="surveys/results/[surveyId]" 
        options={{ 
          headerShown: false,
          title: "Resultados de Encuesta" 
        }} 
      />
    </Stack>
  );
}
