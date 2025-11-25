import type { Href } from "expo-router";
import { router } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CoursesListScreen() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const db = getFirestore();
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setItems(arr);
    });
    return () => unsub();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert("Eliminar", "¿Seguro que quieres eliminar este curso?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const db = getFirestore();
            await deleteDoc(doc(db, "courses", id));
          } catch (e) {
            console.error(e);
            Alert.alert("Error", "No se pudo eliminar el curso.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">Ver cursos</Text>

      {items.length === 0 && (
        <Text className="text-gray-400 mb-4">
          No hay cursos aún. Crea uno para comenzar.
        </Text>
      )}

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View className="bg-gray-900 rounded-2xl px-4 py-3 mb-3 flex-row items-center">
            <View className="flex-1">
              <Text className="text-white font-semibold">{item.title}</Text>
              <Text className="text-gray-400">
                {item.teacher} · {item.level}
              </Text>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                className="bg-white rounded-xl px-4 py-2"
                onPress={() =>
                  router.push({
                    pathname: "/private/admin/courses/[id]",
                    params: { id: String(item.id) },
                  } as Href)
                }
              >
                <Text className="font-semibold">Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-500 rounded-xl px-4 py-2"
                onPress={() => handleDelete(item.id)}
              >
                <Text className="text-white font-semibold">Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        className="bg-gray-800 rounded-2xl px-5 py-3 mt-4"
        onPress={() => router.replace("/private/admin/courses/index")}
      >
        <Text className="text-center text-white font-semibold">Volver</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
