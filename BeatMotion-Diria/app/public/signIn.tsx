import { Button, View, Text, Alert } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import TextField from "@/components/TextField";
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Guardar datos extra en Firestore
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
      Alert.alert(
        "Error",
        "No se pudo registrar el usuario. Inténtalo de nuevo.",
        [{ text: "OK" }]
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
    <SafeAreaView className="flex-1 justify-center items-center p-4 w-full">
      <View className="bg-white p-4 rounded-lg gap-4 w-72">
        <Text className="text-xl font-bold text-primary">
          Registrar Usuario
        </Text>
        <TextField
          label="Nombre"
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
          error={formErrors.name}
        />
        <TextField
          label="Apellido"
          placeholder="Apellido"
          value={lastName}
          onChangeText={setLastName}
          error={formErrors.lastName}
        />
        <TextField
          label="Teléfono"
          placeholder="Teléfono"
          value={phone}
          onChangeText={setPhone}
          error={formErrors.phone}
        />
        <TextField
          label="Email"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          error={formErrors.email}
        />
        <TextField
          label="Contraseña"
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={formErrors.password}
        />
        <Button title="Ingresar" onPress={register} />
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
