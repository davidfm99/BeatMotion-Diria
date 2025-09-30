import { View, Text, TouchableHighlight, Alert } from "react-native";
import TextField from "@/components/TextField";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
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
      .catch((error) => {
        Alert.alert(
          "Error",
          "No se pudo enviar el correo de restablecimiento. Inténtalo de nuevo."
        );
      });
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center p-4 w-full">
      <View className="bg-white p-4 rounded-lg gap-4 w-72">
        <Text className="text-xl font-bold text-primary">
          Restablecer contraseña
        </Text>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
        />
        <View className="flex-col gap-3">
          <Text className="text-sm text-gray-500">
            Se enviará un enlace para restablecer la contraseña al correo
            electrónico proporcionado.
          </Text>
        </View>
        <View className="bg-primary rounded">
          <TouchableHighlight onPress={handleResetPassword}>
            <Text className="text-white p-2 text-center">Enviar enlace</Text>
          </TouchableHighlight>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ResetPassword;
