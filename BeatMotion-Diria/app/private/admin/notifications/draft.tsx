import { firestore } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { addDoc, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Draft {
  id: string;
  title: string;
  content: string;
  recipients: User[];
}

export default function DraftScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [draftsLocal, setDraftsLocal] = useState<Draft[]>([]);
  const [draft, setDraft] = useState<Draft>({
    id: Date.now().toString(),
    title: "",
    content: "",
    recipients: [],
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "users"));
        const list = snapshot.docs.map((doc) => {
          const data = doc.data() as {
            email?: string;
            firstName?: string;
            lastName?: string;
          };
          return {
            id: doc.id,
            email: data.email || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
          } as User;
        });
        setUsers(list);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "No se pudieron cargar los usuarios.");
      }
    };
    loadUsers();
  }, []);

  const handleChange = (key: keyof Draft, value: any) => {
    setDraft({ ...draft, [key]: value });
  };

  // 🔹 Guardar borrador local
  const saveDraftLocal = () => {
    if (!draft.title || !draft.content) {
      Alert.alert("Error", "Título y contenido obligatorios.");
      return;
    }

    setDraftsLocal((prev) => {
      const exists = prev.find((d) => d.id === draft.id);
      if (exists) {
        return prev.map((d) => (d.id === draft.id ? draft : d));
      } else {
        return [...prev, draft];
      }
    });

    setDraft({
      id: Date.now().toString(),
      title: "",
      content: "",
      recipients: [],
    });
  };

  const deleteDraftLocal = (id: string) => {
    setDraftsLocal((prev) => prev.filter((d) => d.id !== id));
  };

  const editDraftLocal = (d: Draft) => {
    setDraft(d);
  };

  const sendDraftFirebase = async (d: Draft) => {
    if (d.recipients.length === 0) {
      Alert.alert("Error", "Selecciona al menos un destinatario.");
      return;
    }

    try {
      await addDoc(collection(firestore, "drafts"), {
        ...d,
        status: "sent",
        createdAt: new Date().toISOString(),
      });

      setDraftsLocal((prev) => prev.filter((b) => b.id !== d.id));
      Alert.alert("Éxito", "Comunicado enviado a Firebase.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo enviar el comunicado.");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(recipientQuery.toLowerCase())
  );

  return (
    <View>
      <ScrollView className="flex-1 " style={{ flex: 1, padding: 20, backgroundColor: "#000" }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#fff",
            marginBottom: 10,
          }}
        >
          Editor de Borradores
        </Text>

        <TextInput
          placeholder="Título"
          placeholderTextColor="#aaa"
          value={draft.title}
          onChangeText={(text) => handleChange("title", text)}
          style={{
            backgroundColor: "#222",
            color: "#fff",
            padding: 12,
            borderRadius: 10,
            marginBottom: 10,
          }}
        />

        <TextInput
          placeholder="Contenido"
          placeholderTextColor="#aaa"
          value={draft.content}
          onChangeText={(text) => handleChange("content", text)}
          multiline
          style={{
            backgroundColor: "#222",
            color: "#fff",
            padding: 12,
            borderRadius: 10,
            marginBottom: 10,
            minHeight: 100,
            textAlignVertical: "top",
          }}
        />

        <TextInput
          placeholder="Buscar destinatarios por email..."
          placeholderTextColor="#aaa"
          value={recipientQuery}
          onChangeText={setRecipientQuery}
          style={{
            backgroundColor: "#222",
            color: "#fff",
            padding: 12,
            borderRadius: 10,
            marginBottom: 5,
          }}
        />

        {recipientQuery.length > 0 && (
          <ScrollView
            style={{
              maxHeight: 150,
              backgroundColor: "#333",
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            {filteredUsers.map((u) => (
              <TouchableOpacity
                key={u.id}
                onPress={() => {
                  if (!draft.recipients.some((r) => r.id === u.id)) {
                    setDraft({
                      ...draft,
                      recipients: [...draft.recipients, u],
                    });
                  }
                  setRecipientQuery("");
                }}
                style={{
                  padding: 10,
                  borderBottomColor: "#555",
                  borderBottomWidth: 1,
                }}
              >
                <Text style={{ color: "#fff" }}>{u.email}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Destinatarios seleccionados */}
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}
        >
          {draft.recipients.map((r) => (
            <View
              key={r.id}
              style={{
                backgroundColor: "#1E90FF",
                padding: 5,
                margin: 2,
                borderRadius: 5,
              }}
            >
              <Text style={{ color: "#fff" }}>{r.email}</Text>
            </View>
          ))}
        </View>

        {/* Botón Guardar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={saveDraftLocal}
            style={{
              backgroundColor: "#1E90FF",
              padding: 12,
              borderRadius: 10,
              flex: 1,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              {draft.id ? "Guardar Borrador" : "Guardar Borrador"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Borradores locales */}
        <Text style={{ fontSize: 20, color: "#fff", marginBottom: 10 }}>
          Borradores Guardados
        </Text>
        {draftsLocal.map((d) => (
          <View
            key={d.id}
            style={{
              backgroundColor: "#222",
              padding: 10,
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>{d.title}</Text>
            <Text style={{ color: "#ccc" }}>
              Destinatarios:{" "}
              {d.recipients.map((r) => r.email).join(", ") || "—"}
            </Text>

            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <TouchableOpacity
                onPress={() => editDraftLocal(d)}
                style={{ marginRight: 10 }}
              >
                <Text style={{ color: "#1E90FF" }}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteDraftLocal(d.id)}
                style={{ marginRight: 10 }}
              >
                <Text style={{ color: "red" }}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendDraftFirebase(d)}>
                <Text style={{ color: "#32CD32" }}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      {/* Botón flotante para historial */}
      <TouchableOpacity
        onPress={() => router.push("/private/admin/draftHistory")}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#FFA500",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Ionicons name="document-text-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
