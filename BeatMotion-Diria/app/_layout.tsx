import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../firebaseConfig";

import useUserStore from "@/store/useUserStore";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const { user, setUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Current user:", currentUser);
      setUser(currentUser);
    });
    return unsubscribe;
  }, [setUser]);

  useEffect(() => {
    console.log("User state changed:", user);
    if (!user === null) {
      router.push("/public/login");
    }
  }, [user, router]);

  const colorScheme = useColorScheme();

  // if (user) {
  //   signOut(auth);
  // }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="public" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="private" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
