import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Stack } from "expo-router";
import { auth } from "@/firebaseConfig";

export default function PrivateLayout() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Usuario logeado con uid:", user.uid);
    } else {
      console.log("Usuario no logeado");
    }
  });

  return (
    <Stack initialRouteName="home">
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}
