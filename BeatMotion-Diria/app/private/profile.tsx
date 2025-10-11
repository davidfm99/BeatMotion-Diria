import { useEffect, useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import useUserStore from "@/store/useUserStore";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";


type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export default function ProfileScreen() {
  const { user } = useUserStore();

  const currentUser = useMemo(() => {
    return user ?? auth.currentUser;
  }, [user]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
  const load = async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const email = currentUser.email ?? "";

    const dbFs = getFirestore();
    const snap = await getDoc(doc(dbFs, "users", uid));

    if (snap.exists()) {
      const data = snap.data() as any;
      const normalized = {
        firstName: data.firstName ?? data.name ?? "",
        lastName: data.lastName ?? "",
        phone: data.phone ?? "",
        email: data.email ?? email,
      };
      setProfile(normalized);
      setFirstName(normalized.firstName);
      setLastName(normalized.lastName);
      setPhone(normalized.phone);
    } else {
      await setDoc(doc(dbFs, "users", uid), {
        firstName: "",
        lastName: "",
        phone: "",
        email,
      });
      setProfile({ firstName: "", lastName: "", phone: "", email });
    }
  };
  load();
}, [currentUser]);
// Guardar cambios del perfil
  const handleSave = async () => {
    try {
      if (!currentUser) return;
      const dbFs = getFirestore();
      await updateDoc(doc(dbFs, "users", currentUser.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: currentUser.email ?? "",
      });


      try {
        await updateProfile(currentUser, { displayName: `${firstName} ${lastName}`.trim() });
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
      router.replace("/public/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const goHome = () => {
    router.replace("/private/home");
  };

  if (!currentUser || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-white text-lg">Cargando usuario...</Text>
      </View>
    );
  }

   // UI del perfil
  return (
    <ScrollView className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">Mi perfil</Text>

      <View className="items-center mb-8">
        {currentUser.photoURL ? (
          <Image
            source={{ uri: currentUser.photoURL }}
            className="w-28 h-28 rounded-full mb-4"
          />
        ) : (
          <View className="w-28 h-28 rounded-full bg-gray-800 mb-4 items-center justify-center">
            <Text className="text-white text-xl">
              {(profile.firstName?.[0] ?? currentUser.email?.[0] ?? "U").toUpperCase()}
            </Text>
          </View>
        )}
        <Text className="text-white text-xl font-semibold">
          {`${profile.firstName} ${profile.lastName}`.trim() || "Sin nombre"}
        </Text>
        <Text className="text-gray-400">{profile.email || "Sin correo"}</Text>
      </View>

      {!editing ? (
        <View className="bg-gray-900 rounded-2xl p-4 mb-8">
          <Text className="text-white font-semibold mb-3">Datos</Text>
          <View className="mb-3">
            <Text className="text-gray-400 text-xs mb-1">Nombre</Text>
            <Text className="text-white">{profile.firstName || "—"}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-gray-400 text-xs mb-1">Apellido</Text>
            <Text className="text-white">{profile.lastName || "—"}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-gray-400 text-xs mb-1">Teléfono</Text>
            <Text className="text-white">{profile.phone || "—"}</Text>
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
              className="bg-white rounded-2xl px-5 py-4 active:opacity-80"
              onPress={handleSave}
            >
              <Text className="text-center font-semibold">Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-700 rounded-2xl px-5 py-4 active:opacity-80"
              onPress={() => {
                setEditing(false);
                if (profile) {
                  setFirstName(profile.firstName);
                  setLastName(profile.lastName);
                  setPhone(profile.phone);
                }
              }}
            >
              <Text className="text-center font-semibold text-white">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="gap-3">
        <TouchableOpacity
          className="bg-white rounded-2xl px-5 py-4 active:opacity-80"
          onPress={goHome}
          accessibilityLabel="Volver a inicio"
        >
          <Text className="text-center font-semibold">Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-500 rounded-2xl px-5 py-4 active:opacity-80"
          onPress={handleLogout}
          accessibilityLabel="Cerrar sesión"
        >
          <Text className="text-center font-semibold text-white">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}