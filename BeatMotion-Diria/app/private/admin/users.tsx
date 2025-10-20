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
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { useActiveUser } from "@/hooks/UseActiveUser";
import { useUsers } from "@/hooks/useUsers";
import DataLoader from "@/components/DataLoader";

export default function AdminUsersScreen() {
  const { user } = useActiveUser();
  const router = useRouter();
  const usersQuery = useUsers();

  // Protect access
  useEffect(() => {
    if (user?.role !== "admin") {
      Alert.alert(
        "Acceso restringido",
        "Solo los administradores pueden ver esta sección"
      );
      router.replace("/private/home");
    }
  }, [user, router]);

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

  return (
    <View className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">
        Gestión de usuarios
      </Text>
      <DataLoader
        query={usersQuery}
        emptyMessage="No hay usuarios registrados."
      >
        {(data) => (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
          />
        )}
      </DataLoader>
    </View>
  );
}
