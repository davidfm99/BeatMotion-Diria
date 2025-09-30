import { Button, View, Text } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import TextField from "@/components/TextField";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const register = async () => {
    const auth = getAuth();
    const db = getFirestore();
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
      console.log("Usuario registrado y datos guardados");
    } catch (error) {
      console.error("Error registrando usuario:", error);
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
        />
        <TextField
          label="Apellido"
          placeholder="Apellido"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextField
          label="Teléfono"
          placeholder="Teléfono"
          value={phone}
          onChangeText={setPhone}
        />
        <TextField
          label="Email"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextField
          label="Contraseña"
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Ingresar" onPress={register} />
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
