import {
  Button,
  View,
  Text,
  TextInput,
  TouchableHighlight,
} from "react-native";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import useUserStore from "@/store/useUserStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUserStore();

  const handleLogin = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setUser(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
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
          <TouchableHighlight>
            <Text className="text-sm text-secondary underline">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => {
              router.push("/public/signIn");
            }}
          >
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
