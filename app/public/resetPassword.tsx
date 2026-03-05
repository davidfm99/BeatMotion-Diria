import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "expo-router";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const auth = getAuth();
  const router = useRouter();

  const handleResetPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert("Éxito", "Se ha enviado el correo de restablecimiento", [
          { text: "OK", onPress: () => router.push("/public/login") },
        ]);
      })
      .catch(() => {
        Alert.alert(
          "Error",
          "No se pudo enviar el correo de restablecimiento. Inténtalo de nuevo."
        );
      });
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center px-5 bg-black w-full">
      <View className="bg-gray-900 w-full max-w-md rounded-3xl p-7 gap-5 shadow-lg border border-gray-800">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-white">Restablecer contraseña</Text>
          <Text className="text-gray-400 text-sm">
            Ingresa tu correo para enviar el enlace de recuperación
          </Text>
        </View>

        <TextInput
          placeholder="Email"
          className="border border-gray-800 bg-gray-950 text-white rounded-xl px-4 py-3 placeholder:text-gray-500"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          className="bg-emerald-400 rounded-xl py-3 active:opacity-80"
          onPress={handleResetPassword}
        >
          <Text className="text-center font-semibold text-black">Enviar enlace</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetPassword;
