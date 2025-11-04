import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { getAuth } from "firebase/auth";
import { router } from "expo-router";
import { addCourse } from "@/services/catalog";
import { Picker } from "@react-native-picker/picker";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";

type Teacher = {
  id: string;
  name: string;
  lastName: string;
  email: string;
};

export default function NewCourseScreen() {
  const [title, setTitle] = useState("");
  const [teacher, setTeacher] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [level, setLevel] = useState("Inicial");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const db = getFirestore();
      const q = query(
        collection(db, "users"),
        where("role", "==", "teacher"),
        orderBy("name", "asc")
      );
      
      const snapshot = await getDocs(q);
      const teachersList: Teacher[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        teachersList.push({
          id: doc.id,
          name: data.name || "",
          lastName: data.lastName || "",
          email: data.email || "",
        });
      });

      setTeachers(teachersList);
      
      if (teachersList.length > 0) {
        const firstTeacher = `${teachersList[0].name} ${teachersList[0].lastName}`;
        setTeacher(firstTeacher);
      }
    } catch (error: any) {
      console.error("Error loading teachers:", error);
      if (error.code === 'failed-precondition') {
        Alert.alert(
          "Configuración requerida",
          "Se necesita crear un índice en Firestore. Revisa la consola para el enlace de creación del índice.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "No se pudieron cargar los profesores.");
      }
    } finally {
      setLoadingTeachers(false);
    }
  };

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

      <Text className="text-white mb-2 font-semibold">Título *</Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-4"
        value={title}
        onChangeText={setTitle}
        placeholder="Título del curso"
        placeholderTextColor="#9CA3AF"
      />

      <Text className="text-white mb-2 font-semibold">Profesor *</Text>
      {loadingTeachers ? (
        <View className="bg-gray-900 rounded-xl px-4 py-3 mb-4">
          <Text className="text-gray-400">Cargando profesores...</Text>
        </View>
      ) : teachers.length === 0 ? (
        <View className="bg-gray-900 rounded-xl px-4 py-3 mb-4">
          <Text className="text-gray-400">No hay usuarios con rol de profesor</Text>
          <Text className="text-gray-500 text-xs mt-2">Asigna el rol profesor a un usuario</Text>
        </View>
      ) : (
        <View className="bg-gray-900 rounded-xl mb-4">
          <Picker
            selectedValue={teacher}
            onValueChange={(value) => setTeacher(String(value))}
            dropdownIconColor="#ffffff"
            style={{ color: "white" }}
          >
            {teachers.map((t) => (
              <Picker.Item 
                key={t.id} 
                label={`${t.name} ${t.lastName}`}
                value={`${t.name} ${t.lastName}`}
              />
            ))}
          </Picker>
        </View>
      )}

      <Text className="text-white mb-2 font-semibold">Nivel *</Text>
      <View className="bg-gray-900 rounded-xl mb-4">
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

      <Text className="text-white mb-2 font-semibold">Descripción</Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-4"
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción del curso"
        placeholderTextColor="#9CA3AF"
        multiline
      />

      <Text className="text-white mb-2 font-semibold">Imagen (URL)</Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-6"
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="https://..."
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity
        className="bg-primary rounded-2xl px-5 py-4 active:opacity-80 mb-3"
        onPress={handleSave}
        disabled={isSaving || loadingTeachers || teachers.length === 0}
      >
        <Text className="text-center font-semibold">
          {isSaving ? "Guardando..." : "Guardar curso"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-800 rounded-2xl px-5 py-3"
        onPress={() => router.back()}
      >
        <Text className="text-center text-white font-semibold">Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}