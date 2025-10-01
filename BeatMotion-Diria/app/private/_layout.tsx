import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Stack } from "expo-router";
import { auth } from "@/firebaseConfig";
import useUserStore from "@/store/useUserStore";

export default function PrivateLayout() {
  const { user } = useUserStore();

  return (
    <Stack initialRouteName="home">
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}
