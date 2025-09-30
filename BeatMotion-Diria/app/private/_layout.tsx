import { getAuth, onAuthStateChanged } from "firebase/auth";
import { View } from "react-native/Libraries/Components/View/View";
import { Stack } from "expo-router";

export default function TabLayout() {
  const auth = getAuth();
  const user = auth.currentUser;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      console.log("Usuario logeado con uid:", uid);
      // ...
    } else {
      // User is signed out
      console.log("Usuario no logeado");
    }
  });

  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false }} />
    </Stack>
  );
}
