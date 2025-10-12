import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import { useUserInfo } from "@/hooks/useUserInfo";
import DataLoader from "@/components/DataLoader";

export default function AdminUserProfile() {
  const { uid } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const userQuery = useUserInfo(uid as string);

  // Editable fields
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");

  // Save updates
  const handleSave = async () => {
    try {
      const ref = doc(firestore, "users", uid as string);

      await updateDoc(ref, {
        name: name.trim(), // "Nombre" updates the 'name' field
        lastName: lastName.trim(), // "Apellido" updates the 'lastName' field
        phone: phone.trim(),
        role,
      });

      Alert.alert("Éxito", "Información actualizada correctamente.");
      setProfile({ ...profile, name, lastName, phone, role });
      setEditing(false);
    } catch (err) {
      console.error("Error saving user:", err);
      Alert.alert("Error", "No se pudo actualizar el usuario.");
    }
  };

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-white text-lg">Cargando usuario...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">
        Perfil de usuario
      </Text>

      <DataLoader query={userQuery}>
        {(data) => {
          setProfile(data);
          setName(data?.name || "");
          setLastName(data?.lastName || "");
          setPhone(data?.phone || "");
          setRole(data?.role || "user");
          return (
            <>
              {/* Avatar */}
              <View className="items-center mb-8">
                {profile.photoURL ? (
                  <Image
                    source={{ uri: profile.photoURL }}
                    className="w-28 h-28 rounded-full mb-4"
                  />
                ) : (
                  <View className="w-28 h-28 rounded-full bg-gray-800 mb-4 items-center justify-center">
                    <Text className="text-white text-xl">
                      {(name?.[0] ?? profile.email?.[0] ?? "U").toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text className="text-white text-xl font-semibold">
                  {`${name} ${lastName}`.trim() || "Sin nombre"}
                </Text>
                <Text className="text-gray-400">
                  {profile.email || "Sin correo"}
                </Text>
              </View>

              {/* User Info */}
              <View className="bg-gray-900 rounded-2xl p-4 mb-8">
                <Text className="text-white font-semibold mb-3">Datos</Text>

                {/* Nombre */}
                <View className="mb-3">
                  <Text className="text-gray-400 text-xs mb-1">Nombre</Text>
                  {editing ? (
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      className="bg-gray-800 text-white rounded-xl px-3 py-3"
                    />
                  ) : (
                    <Text className="text-white">{name || "—"}</Text>
                  )}
                </View>

                {/* Apellido */}
                <View className="mb-3">
                  <Text className="text-gray-400 text-xs mb-1">Apellido</Text>
                  {editing ? (
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      className="bg-gray-800 text-white rounded-xl px-3 py-3"
                    />
                  ) : (
                    <Text className="text-white">{lastName || "—"}</Text>
                  )}
                </View>

                {/* Teléfono */}
                <View className="mb-3">
                  <Text className="text-gray-400 text-xs mb-1">Teléfono</Text>
                  {editing ? (
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      className="bg-gray-800 text-white rounded-xl px-3 py-3"
                    />
                  ) : (
                    <Text className="text-white">{phone || "—"}</Text>
                  )}
                </View>

                {/* Rol */}
                <View className="mb-3">
                  <Text className="text-gray-400 text-xs mb-1">Rol</Text>
                  {editing ? (
                    <View className="bg-gray-800 rounded-xl">
                      <Picker
                        selectedValue={role}
                        onValueChange={(value: string) => setRole(value)}
                        dropdownIconColor="white"
                        style={{ color: "white" }}
                      >
                        <Picker.Item label="Usuario" value="user" />
                        <Picker.Item label="Administrador" value="admin" />
                        <Picker.Item label="Profesor" value="teacher" />
                      </Picker>
                    </View>
                  ) : (
                    <Text className="text-white capitalize">
                      {role === "user"
                        ? "Usuario"
                        : role === "admin"
                        ? "Administrador"
                        : "Profesor"}
                    </Text>
                  )}
                </View>
              </View>

              {/* Buttons */}
              <View className="gap-3">
                {editing ? (
                  <>
                    <TouchableOpacity
                      className="bg-white rounded-2xl px-5 py-4 active:opacity-80"
                      onPress={handleSave}
                    >
                      <Text className="text-center font-semibold">
                        Guardar cambios
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-gray-700 rounded-2xl px-5 py-4 active:opacity-80"
                      onPress={() => setEditing(false)}
                    >
                      <Text className="text-center font-semibold text-white">
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      className="bg-white rounded-2xl px-5 py-4 active:opacity-80"
                      onPress={() => setEditing(true)}
                    >
                      <Text className="text-center font-semibold">
                        Editar información
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-gray-700 rounded-2xl px-5 py-4 active:opacity-80"
                      onPress={() => router.back()}
                    >
                      <Text className="text-center font-semibold text-white">
                        Volver
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          );
        }}
      </DataLoader>
    </ScrollView>
  );
}
