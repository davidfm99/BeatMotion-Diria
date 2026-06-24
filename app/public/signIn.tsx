import { signInValidationSchema } from "@/constants/validationForms";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

const PRIVACY_POLICY_URL = "https://beatmotion-politica-privacidad.netlify.app";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [consentAccepted, setConsentAccepted] = useState(false);

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
        { abortEarly: false },
      );
      setFormErrors({
        name: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
      });
      return true;
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
      return false;
    }
  };

  const register = async () => {
    const auth = getAuth();
    const db = getFirestore();
    if (!validateForm()) {
      return;
    }
    if (!consentAccepted) {
      Alert.alert(
        "Consentimiento requerido",
        "Debes aceptar la política de privacidad para registrarte.",
        [{ text: "OK" }],
      );
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        lastName: lastName,
        phone: phone,
        email: user.email,
        createdAt: new Date(),
        uid: user.uid,
        role: "user",
        isActive: true,
        consentAccepted: true,
        consentAcceptedAt: new Date(),
      });
      handleClearValues();
      Alert.alert("Registro exitoso", "Usuario registrado y datos guardados", [
        { text: "continuar", onPress: () => console.log("Continuar") },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo registrar el usuario. Inténtalo de nuevo.",
        [{ text: "OK" }],
      );
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
          <Text className="text-2xl font-bold text-white">
            Registrar Usuario
          </Text>
          <Text className="text-gray-400 text-sm">
            Crea tu cuenta para continuar
          </Text>
        </View>

        <View className="gap-3">
          <View>
            <TextInput
              placeholder="Nombre"
              className="border border-gray-800 bg-gray-950 text-white rounded-xl px-4 py-3 placeholder:text-gray-500"
              value={name}
              onChangeText={setName}
            />
            {formErrors.name ? (
              <Text className="text-red-500 text-xs mt-1 ml-3">
                {formErrors.name}
              </Text>
            ) : null}
          </View>
          <View>
            <TextInput
              placeholder="Apellido"
              className="border border-gray-800 bg-gray-950 text-white rounded-xl px-4 py-3 placeholder:text-gray-500"
              value={lastName}
              onChangeText={setLastName}
            />
            {formErrors.lastName ? (
              <Text className="text-red-500 text-xs mt-1 ml-3">
                {formErrors.lastName}
              </Text>
            ) : null}
          </View>
          <View>
            <TextInput
              placeholder="Teléfono"
              className="border border-gray-800 bg-gray-950 text-white rounded-xl px-4 py-3 placeholder:text-gray-500"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            {formErrors.phone ? (
              <Text className="text-red-500 text-xs mt-1 ml-3">
                {formErrors.phone}
              </Text>
            ) : null}
          </View>
          <View>
            <TextInput
              placeholder="Email"
              className="border border-gray-800 bg-gray-950 text-white rounded-xl px-4 py-3 placeholder:text-gray-500"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {formErrors.email ? (
              <Text className="text-red-500 text-xs mt-1 ml-3">
                {formErrors.email}
              </Text>
            ) : null}
          </View>
          <View>
            <TextInput
              placeholder="Contraseña"
              className="border border-gray-800 bg-gray-950 text-white rounded-xl px-4 py-3 placeholder:text-gray-500"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {formErrors.password ? (
              <Text className="text-red-500 text-xs mt-1 ml-3">
                {formErrors.password}
              </Text>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={() => setConsentAccepted((v) => !v)}
          className="flex-row items-start gap-3"
        >
          <View
            className={`mt-0.5 h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
              consentAccepted
                ? "border-emerald-400 bg-emerald-400"
                : "border-gray-600 bg-gray-950"
            }`}
          >
            {consentAccepted && (
              <Text className="text-xs font-bold text-black">✓</Text>
            )}
          </View>
          <Text className="flex-1 text-xs leading-5 text-gray-400">
            He leído y acepto la{" "}
            <Text
              className="text-emerald-400 underline"
              onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            >
              Política de Privacidad
            </Text>{" "}
            y el tratamiento de mis datos conforme a las Leyes N.° 8.968 y N.°
            9.048 de Costa Rica, incluida la transferencia a servidores de
            Firebase (Google LLC) fuera de Costa Rica.
          </Text>
        </Pressable>

        <TouchableOpacity
          className={`rounded-xl py-3 active:opacity-80 ${consentAccepted ? "bg-emerald-400" : "bg-emerald-900"}`}
          onPress={register}
          disabled={!consentAccepted}
        >
          <Text
            className={`text-center font-semibold ${consentAccepted ? "text-black" : "text-gray-500"}`}
          >
            Crear cuenta
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
