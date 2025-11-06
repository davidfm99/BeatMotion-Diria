import DataLoader from "@/components/DataLoader";
import { firestore } from "@/firebaseConfig";
import { useDraft } from "@/hooks/notifications/useDraft";
import { deleteDoc, doc } from "firebase/firestore";
import React from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

interface Draft {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function DraftHistoryScreen() {
  const useDraftQuery = useDraft();

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, "drafts", id));
      Alert.alert("Éxito", "Borrador eliminado");
      // Actualizar la lista localmente
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo eliminar el borrador");
    }
  };

  return (
    <View>
      <DataLoader
        query={useDraftQuery}
        emptyMessage="No hay borradores guardados."
      >
        {(draft) => (
          <FlatList
            data={draft}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View key={item.id} className="bg-[#222] p-2.5 rounded-xl mb-2.5">
                <Text className="text-white font-bold">{item.title}</Text>
                <Text className="text-gray-300">{item.content}</Text>
                <Text className="text-gray-400">Creado: {item.createdAt}</Text>

                {/* Botón Eliminar */}
                <TouchableOpacity
                  onPress={() => handleDelete(draft.id)}
                  className="mt-2.5 bg-red-600 p-2 rounded-lg items-center"
                >
                  <Text className="text-white font-bold">Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </DataLoader>
    </View>
  );
}
