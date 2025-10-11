import {
  Button,
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Alert,
} from "react-native";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firestore } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import useUserStore from "@/store/useUserStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, setRole } = useUserStore();
  const router = useRouter();

  console.log("useUserStore state:", useUserStore());


const fetchUserRole = async (uid: string) => {
  try {
    
    const userDoc = await getDoc(doc(firestore, "users", uid));

    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log("Firestore user data:", data);
      return data.role ?? "user";
    } else {
      console.warn("User document not found in Firestore");
      return "user";
    }
  } catch (error) {
    console.error("Error fetching user role from Firestore:", error);
    return "user";
  }
};


const handleLogin = async () => {
  const auth = getAuth();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    setUser(firebaseUser);

    const role = await fetchUserRole(firebaseUser.uid);
    setRole(role);

    console.log("Logged in with Firestore role:", role);

    Alert.alert("Éxito", "Inicio de sesión exitoso", [
      { text: "OK", onPress: () => router.push("/private/home") },
    ]);
  } catch (error) {
    console.error("Login error:", error);
    Alert.alert(
      "Error",
      "Hubo un problema al iniciar sesión. Verifica tus credenciales o conexión.",
      [{ text: "OK" }]
    );
  }
};

  return (
    <SafeAreaView className="flex-1 justify-center items-center p-4 w-full">
      <View className="bg-white p-4 rounded-lg gap-8 w-72">
        <Text className="text-xl font-bold text-primary">Iniciar sesión</Text>
        <TextInput
          placeholder="Email"
          className="border border-gray-100 p-2 rounded text-black placeholder:text-gray-400"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Contraseña"
          value={password}
          className="border border-gray-100 p-2 rounded text-black placeholder:text-gray-400"
          onChangeText={setPassword}
          secureTextEntry
        />
        <View className="flex-col gap-3">
          <TouchableHighlight onPress={() => router.push("/public/resetPassword")}>
            <Text className="text-sm text-secondary underline">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => router.push("/public/signIn")}>
            <Text className="text-sm text-secondary underline">
              ¿No tienes una cuenta? Regístrate
            </Text>
          </TouchableHighlight>
        </View>

        <Button title="Ingresar" onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
};

export default LogIn;