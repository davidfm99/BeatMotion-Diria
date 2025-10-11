import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";

export default function AdminUserProfile() {
  const { uid } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const ref = doc(firestore, "users", uid as string);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUser(data);
          setFirstName(data.name || "");
          setLastName(data.lastName || "");
          setPhone(data.phone || "");
          setRole(data.role || "user");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        Alert.alert("Error", "No se pudo cargar el usuario.");
      }
    };
    fetchUser();
  }, [uid]);

  const handleSave = async () => {
    try {
      const ref = doc(firestore, "users", uid as string);
      await updateDoc(ref, {
        name: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        role,
      });
      Alert.alert("Éxito", "Datos actualizados correctamente");
      router.back();
    } catch (err) {
      console.error("Error updating user:", err);
      Alert.alert("Error", "No se pudo actualizar el usuario.");
    }
  };

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Cargando usuario...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">Editar usuario</Text>

      <View className="bg-gray-900 rounded-2xl p-4 mb-8">
        <Text className="text-gray-400 text-xs mb-1">Nombre</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          className="bg-gray-800 text-white rounded-xl px-3 py-3 mb-3"
        />

        <Text className="text-gray-400 text-xs mb-1">Apellido</Text>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          className="bg-gray-800 text-white rounded-xl px-3 py-3 mb-3"
        />

        <Text className="text-gray-400 text-xs mb-1">Teléfono</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          className="bg-gray-800 text-white rounded-xl px-3 py-3 mb-3"
        />

        <Text className="text-gray-400 text-xs mb-1">Rol</Text>
        <TextInput
          value={role}
          onChangeText={setRole}
          className="bg-gray-800 text-white rounded-xl px-3 py-3 mb-3"
        />
      </View>

      <TouchableOpacity
        className="bg-white rounded-2xl px-5 py-4 mb-4"
        onPress={handleSave}
      >
        <Text className="text-center font-semibold">Guardar cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-700 rounded-2xl px-5 py-4"
        onPress={() => router.back()}
      >
        <Text className="text-center font-semibold text-white">Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}