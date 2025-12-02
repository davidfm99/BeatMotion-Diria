import HeaderTitle from "@/components/headerTitle";
import { auth } from "@/firebaseConfig";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { useUserInfo } from "@/hooks/user/useUserInfo";
import { QueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { signOut, updateProfile } from "firebase/auth";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user: activeUser } = useActiveUser();
  const userInfo = useUserInfo(activeUser?.uid as string);

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");

  useEffect(() => {
    if (userInfo.data) {
      console.log(userInfo.data);
      setFirstName(userInfo.data.name);
      setLastName(userInfo.data.lastName);
      setPhone(userInfo.data.phone || "");
      setPhotoUrl(userInfo.data?.photoURL || null);
      setEmail(userInfo.data.email);
    }
  }, [userInfo.data]);

  // Guardar cambios del perfil
  const handleSave = async () => {
    try {
      if (!activeUser) return;
      const dbFs = getFirestore();
      await updateDoc(doc(dbFs, "users", activeUser?.uid || ""), {
        name: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });

      try {
        if (auth.currentUser)
          await updateProfile(auth.currentUser, {
            displayName: `${firstName} ${lastName}`.trim(),
          });
      } catch (e) {
        console.warn("No se pudo actualizar displayName en Auth:", e);
      }

      setEditing(false);
      Alert.alert("Perfil", "Perfil actualizado correctamente.");
    } catch (err) {
      console.error("Error saving profile:", err);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    }
  };

  // Cerrar sesion y volver a login publico
  const handleLogout = async () => {
    try {
      await signOut(auth);
      const queryClient = new QueryClient();
      queryClient.invalidateQueries({ queryKey: ["activeUser"] });
      router.replace("/public/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const resetState = () => {
    if (userInfo.data) {
      setFirstName(userInfo.data.name);
      setLastName(userInfo.data.lastName);
      setPhone(userInfo.data.phone || "");
      setPhotoUrl(userInfo.data?.photoURL || null);
      setEmail(userInfo.data.email);
    }
  };

  if (userInfo.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-white text-lg">Cargando usuario...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <HeaderTitle title="Mi Perfil" />

      <ScrollView className="px-4">
        <View className="items-center mb-8">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="w-28 h-28 rounded-full mb-4"
            />
          ) : (
            <View className="w-28 h-28 rounded-full bg-gray-800 mb-4 items-center justify-center">
              <Text className="text-white text-xl">
                {(firstName?.[0] ?? email?.[0] ?? "U").toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-white text-xl font-semibold">
            {`${firstName} ${lastName}`.trim() || "Sin nombre"}
          </Text>
          <Text className="text-gray-400">{email || "Sin correo"}</Text>
        </View>

        {!editing ? (
          <View className="bg-gray-900 rounded-2xl p-4 mb-8">
            <Text className="text-white font-semibold mb-3">Datos</Text>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Nombre</Text>
              <Text className="text-white">{firstName || "—"}</Text>
            </View>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Apellido</Text>
              <Text className="text-white">{lastName || "—"}</Text>
            </View>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Teléfono</Text>
              <Text className="text-white">{phone || "—"}</Text>
            </View>

            <View className="gap-3 mt-2">
              <TouchableOpacity
                className="bg-white rounded-2xl px-5 py-4 active:opacity-80"
                onPress={() => setEditing(true)}
              >
                <Text className="text-center font-semibold">Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="bg-gray-900 rounded-2xl p-4 mb-8">
            <Text className="text-white font-semibold mb-3">Editar datos</Text>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Nombre</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Tu nombre"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-800 text-white rounded-xl px-3 py-3"
              />
            </View>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Apellido</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Tu apellido"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-800 text-white rounded-xl px-3 py-3"
              />
            </View>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Teléfono</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Tu teléfono"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-800 text-white rounded-xl px-3 py-3"
              />
            </View>

            <View className="gap-3 mt-2">
              <TouchableOpacity
                className="bg-primary rounded-2xl px-5 py-4 active:opacity-80"
                onPress={handleSave}
              >
                <Text className="text-center font-semibold">Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-700 rounded-2xl px-5 py-4 active:opacity-80"
                onPress={() => {
                  setEditing(false);
                  resetState();
                }}
              >
                <Text className="text-center font-semibold text-white">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          className="bg-red-500 rounded-2xl px-5 py-4 active:opacity-80"
          onPress={handleLogout}
          accessibilityLabel="Cerrar sesión"
        >
          <Text className="text-center font-semibold text-white">
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
