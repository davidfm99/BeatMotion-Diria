import HeaderTitle from "@/components/headerTitle";
import { functions } from "@/firebaseConfig";
import { useAddDraft } from "@/hooks/notifications/useAddDraft";
import { useDraftById } from "@/hooks/notifications/useDraftById";
import { useUpdateDraft } from "@/hooks/notifications/useUpdateDraft";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import { httpsCallable } from "firebase/functions";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OPTIONS = [
  { label: "Todos los usuarios", value: "all" },
  { label: "Estudiantes", value: "user" },
  { label: "Instructores", value: "teacher" },
];

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

enum Recipients {
  "all",
  "user",
  "teacher",
}

export default function DraftScreen() {
  const { draftId } = useLocalSearchParams();
  const isEditing = draftId !== "new";
  const useAddDraftMutation = useAddDraft();
  const useUpdateDraftMutation = useUpdateDraft();
  const draftById = useDraftById(draftId as string);
  //Todo fix this any type
  const [draft, setDraft] = useState<any>({
    title: "",
    content: "",
    recipients: Recipients.all,
  });

  useEffect(() => {
    if (isEditing && draftById.data) setDraft(draftById.data);
  }, [isEditing, draftById.data]);

  const handleChange = (key: keyof Draft, value: any) => {
    setDraft({ ...draft, [key]: value });
  };

  const saveDraftLocal = () => {
    if (!draft.title || !draft.content) {
      Alert.alert("Error", "Título y contenido obligatorios.");
      return;
    }
    if (isEditing) {
      useUpdateDraftMutation.mutate({
        id: draftId as string,
        body: {
          title: draft.title,
          content: draft.content,
          recipients: draft.recipients,
        },
      });
    } else {
      useAddDraftMutation.mutate({
        title: draft.title,
        content: draft.content,
        recipients: draft.recipients,
      });
    }
  };

  const handleSendNotification = async () => {
    saveDraftLocal();
    const sendPush = httpsCallable(functions, "sendExpoPushNotification");
    try {
      const body = {
        title: draft.title,
        content: draft.content,
        userRole: draft.recipients,
      };
      await sendPush({ ...body });
    } catch (_) {
      Alert.alert("Error", "Notificación no pudo ser enviada");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <HeaderTitle title="Guardar Borrador" />

      <ScrollView className="flex-1 p-5">
        <TextInput
          placeholder="Título"
          placeholderTextColor="#aaa"
          value={draft.title}
          onChangeText={(text) => handleChange("title", text)}
          className="bg-neutral-800 text-white p-3 rounded-xl mb-3"
        />

        <TextInput
          placeholder="Contenido"
          placeholderTextColor="#aaa"
          value={draft.content}
          onChangeText={(text) => handleChange("content", text)}
          multiline
          className="bg-neutral-800 text-white p-3 rounded-xl mb-3 min-h-[100px] text-top"
        />

        <View>
          <Text className="text-white text-lg font-bold">A quien enviar</Text>
          <Picker
            mode="dialog"
            selectedValue={draft.recipients}
            onValueChange={(value) => handleChange("recipients", value)}
          >
            {OPTIONS.map((opt, index) => (
              <Picker.Item
                key={`${opt.value}-${index}`}
                label={opt.label}
                value={opt.value}
              />
            ))}
          </Picker>
        </View>

        <View className="flex-row justify-between mb-5">
          <TouchableOpacity
            onPress={saveDraftLocal}
            className="bg-secondary p-3 rounded-xl flex-1"
          >
            <Text className="text-white text-center font-semibold">
              Guardar Borrador
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between mb-5">
          <TouchableOpacity
            onPress={handleSendNotification}
            className="bg-green-600 p-3 rounded-xl flex-1"
          >
            <Text className="text-white text-center font-semibold">
              Enviar notificación
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
