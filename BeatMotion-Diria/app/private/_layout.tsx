import { onAuthStateChanged } from "firebase/auth";
import { Stack } from "expo-router";
import { auth } from "@/firebaseConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function PrivateLayout() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Usuario logeado con uid:", user.uid);
    } else {
      console.log("Usuario no logeado");
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Stack initialRouteName="home">
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
