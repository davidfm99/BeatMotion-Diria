import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import useUserStore from "@/store/useUserStore";
import { useUsers } from "@/hooks/useUsers";

export default function AdminUsersScreen() {
  const { role } = useUserStore();
  const router = useRouter();
  const { data: users, isLoading } = useUsers();

  // Protect access
  useEffect(() => {
    if (role !== "admin") {
      Alert.alert(
        "Acceso restringido",
        "Solo los administradores pueden ver esta sección"
      );
      router.replace("/private/home");
    }
  }, [role, router]);

  const handleDeactivate = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(firestore, "users", uid), { active: !currentStatus });
      Alert.alert(
        "Éxito",
        `Usuario ${!currentStatus ? "activado" : "desactivado"}`
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (uid: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Eliminar este usuario permanentemente?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, "users", uid));
              Alert.alert("Eliminado", "Usuario eliminado de Firestore");
            } catch (error) {
              console.error("Error deleting user:", error);
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: any) => (
    <View className="bg-gray-900 rounded-2xl p-4 mb-3">
      <Text className="text-white font-semibold">
        {item.name} {item.lastName}
      </Text>
      <Text className="text-gray-400">{item.email}</Text>
      <Text className="text-gray-500 italic">Rol: {item.role}</Text>
      <View className="flex-row mt-2 gap-3">
        <TouchableOpacity
          className="bg-blue-500 px-3 py-2 rounded-xl"
          onPress={() => router.push(`/private/admin/user/${item.uid}` as any)}
        >
          <Text className="text-white">Ver Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-yellow-500 px-3 py-2 rounded-xl"
          onPress={() => handleDeactivate(item.id, item.active)}
        >
          <Text className="text-white">
            {item.active ? "Desactivar" : "Activar"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-600 px-3 py-2 rounded-xl"
          onPress={() => handleDelete(item.id)}
        >
          <Text className="text-white">Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator color="white" size="large" />
        <Text className="text-gray-400 mt-3">Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">
        Gestión de usuarios
      </Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
      />
    </View>
  );
}
