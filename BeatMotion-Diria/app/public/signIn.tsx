import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { signInValidationSchema } from "@/constants/validationForms";
import * as Yup from "yup";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [formErrors, setFormErrors] = useState({
    name: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const validateForm = () => {
    try {
      Yup.object(signInValidationSchema).validateSync(
        { name, lastName, phone, email, password },
        { abortEarly: false }
      );
      setFormErrors({
        name: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
      });
    } catch (err: any) {
      const errors = {
        name: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
      };
      err.inner.forEach((error: any) => {
        errors[error.path as keyof typeof errors] = error.message;
      });
      setFormErrors(errors);
    }
    return true;
  };

  const register = async () => {
    const auth = getAuth();
    const db = getFirestore();
    if (!validateForm()) {
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        lastName: lastName,
        phone: phone,
        email: user.email,
        createdAt: new Date(),
        uid: user.uid,
        role: "user",
        active: true,
      });
      handleClearValues();
      Alert.alert("Registro exitoso", "Usuario registrado y datos guardados", [
        { text: "continuar", onPress: () => console.log("Continuar") },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar el usuario. Inténtalo de nuevo.", [
        { text: "OK" },
      ]);
    }
  };

  const handleClearValues = () => {
    setEmail("");
    setPassword("");
    setName("");
    setLastName("");
    setPhone("");
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center px-5 bg-black w-full">
      <View className="bg-gray-900 w-full max-w-md rounded-3xl p-7 gap-4 shadow-lg border border-gray-800">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-white">Registrar Usuario</Text>
          <Text className="text-gray-400 text-sm">Crea tu cuenta para continuar</Text>
        </View>

        <View className="gap-3">
          <TextInput
            placeholder="Nombre"
            className="border border-gray-800 bg-gray-950 text-white rounded-xl px-4 py-3 placeholder:text-gray-500"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Apellido"
            className="border border-gray-800 bg-gray-950 text-white rounded-xl px-4 py-3 placeholder:text-gray-500"
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            placeholder="Teléfono"
            className="border border-gray-800 bg-gray-950 text-white rounded-xl px-4 py-3 placeholder:text-gray-500"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            placeholder="Email"
            className="border border-gray-800 bg-gray-950 text-white rounded-xl px-4 py-3 placeholder:text-gray-500"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            placeholder="Contraseña"
            className="border border-gray-800 bg-gray-950 text-white rounded-xl px-4 py-3 placeholder:text-gray-500"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="bg-emerald-400 rounded-xl py-3 active:opacity-80"
          onPress={register}
        >
          <Text className="text-center font-semibold text-black">Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
