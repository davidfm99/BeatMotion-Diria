import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { getAuth } from "firebase/auth";
import { router } from "expo-router";
import { addCourse } from "@/services/catalog";
import { Picker } from "@react-native-picker/picker";

export default function NewCourseScreen() {
  const [title, setTitle] = useState("");
  const [teacher, setTeacher] = useState("");
  const [level, setLevel] = useState("Inicial");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !teacher.trim()) {
      Alert.alert("Faltan datos", "Título y profesor son obligatorios.");
      return;
    }
    try {
      setIsSaving(true);
      const uid = getAuth().currentUser?.uid ?? "unknown";
      await addCourse({
        title: title.trim(),
        description: description.trim(),
        level: level.trim(),
        teacher: teacher.trim(),
        imageUrl: imageUrl.trim() || undefined,
        isActive: true,
        createdBy: uid,
      });
      Alert.alert("Curso", "Curso agregado correctamente.");
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo guardar el curso.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">Nuevo curso</Text>

      <Text className="text-white mb-1">Título</Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-3"
        value={title}
        onChangeText={setTitle}
        placeholder="Título"
        placeholderTextColor="#9CA3AF"
      />

      <Text className="text-white mb-1">Profesor</Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-3"
        value={teacher}
        onChangeText={setTeacher}
        placeholder="Profesor"
        placeholderTextColor="#9CA3AF"
      />

      <Text className="text-white mb-1">Nivel</Text>
      <View className="bg-gray-900 rounded-xl mb-3">
        <Picker
          selectedValue={level}
          onValueChange={(v) => setLevel(String(v))}
          dropdownIconColor="#ffffff"
          style={{ color: "white" }}
        >
          <Picker.Item label="Inicial" value="Inicial" />
          <Picker.Item label="Intermedio" value="Intermedio" />
          <Picker.Item label="Avanzado" value="Avanzado" />
        </Picker>
      </View>

      <Text className="text-white mb-1">Descripción</Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-3"
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción"
        placeholderTextColor="#9CA3AF"
        multiline
      />

      <Text className="text-white mb-1">Imagen (URL)</Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-6"
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="https://..."
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity
        className="bg-white rounded-2xl px-5 py-4 active:opacity-80"
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text className="text-center font-semibold">
          {isSaving ? "Guardando..." : "Guardar curso"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

