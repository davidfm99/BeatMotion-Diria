import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { firestore } from "@/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

interface Draft {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function DraftHistoryScreen() {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  const loadDrafts = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, "drafts"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Draft[];
      setDrafts(list);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudieron cargar los borradores.");
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

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
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#000" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 10 }}>
        Historial de Borradores
      </Text>

      {drafts.map((d) => (
        <View
          key={d.id}
          style={{ backgroundColor: "#222", padding: 10, borderRadius: 10, marginBottom: 10 }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>{d.title}</Text>
          <Text style={{ color: "#ccc" }}>{d.content}</Text>
          <Text style={{ color: "#32CD32" }}>Estado: {d.status}</Text>
          <Text style={{ color: "#aaa" }}>Creado: {d.createdAt}</Text>

          {/* Botón Eliminar */}
          <TouchableOpacity
            onPress={() => handleDelete(d.id)}
            style={{
              marginTop: 10,
              backgroundColor: "red",
              padding: 8,
              borderRadius: 6,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
