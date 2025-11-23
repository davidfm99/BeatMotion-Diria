import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { useRouter } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoading } = useActiveUser();
  const router = useRouter();

  const handleLogin = async () => {
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      {isLoading ? (
        <ActivityIndicator size="large" color="#40E0D0" className="mb-4" />
      ) : (
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
            <TouchableHighlight
              onPress={() => router.push("/public/resetPassword")}
            >
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
      )}
    </SafeAreaView>
  );
};

export default LogIn;


