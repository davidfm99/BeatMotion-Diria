import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router, useRootNavigationState } from "expo-router";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, collection, query, where, onSnapshot, getDocs, orderBy } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import type { Href } from "expo-router";

type Teacher = {
  id: string;
  name: string;
  lastName: string;
  email: string;
};

export default function EditCourseScreen() {
  const { id, tab } = useLocalSearchParams<{ id?: string; tab?: string | string[] }>();

  const navState = useRootNavigationState();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const invalid = [undefined, null, "", "index", "list", "new"];
    const val = Array.isArray(id) ? id[0] : id;
    if (invalid.includes(val as any)) {
      setNotFound(true);
    }
  }, [id]);

  const [loading, setLoading] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [title, setTitle] = useState("");
  const [teacher, setTeacher] = useState("");
  const [level, setLevel] = useState("Inicial");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [classes, setClasses] = useState<any[]>([]);

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

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      const db = getFirestore();
      const snap = await getDoc(doc(db, "courses", String(id)));
      if (!snap.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = snap.data() as any;
      setTitle(data.title ?? "");
      setTeacher(data.teacher ?? "");
      setLevel(data.level ?? "Inicial");
      setDescription(data.description ?? "");
      setImageUrl(data.imageUrl ?? "");
      setIsActive(Boolean(data.isActive));
      setLoading(false);
    };
    if (id) loadCourse();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const q = query(collection(db, "classes"), where("courseId", "==", String(id)));
    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setClasses(arr);
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (notFound && navState?.key) {
      router.replace("/private/admin/coursesMenu");
    }
  }, [notFound, navState?.key]);

  const handleUpdateCourse = async () => {
    if (!title.trim() || !teacher.trim()) {
      Alert.alert("Faltan datos", "Título y profesor son obligatorios.");
      return;
    }

    try {
      const db = getFirestore();
      await updateDoc(doc(db, "courses", String(id)), {
        title: title.trim(),
        teacher: teacher.trim(),
        level: level.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || "",
        isActive,
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Curso", "Actualizado correctamente.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo actualizar el curso.");
    }
  };

  if (loading || loadingTeachers) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Cargando...</Text>
      </View>
    );
  }

  const showClassesTab = Array.isArray(tab) ? tab[0] === "classes" : tab === "classes";

  return (
    <ScrollView className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">
        {showClassesTab ? "Clases del curso" : "Editar curso"}
      </Text>

      {!showClassesTab ? (
        <>
          <Text className="text-white mb-2 font-semibold">Título *</Text>
          <TextInput
            className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-4"
            value={title}
            onChangeText={setTitle}
            placeholder="Título"
            placeholderTextColor="#9CA3AF"
          />

          <Text className="text-white mb-2 font-semibold">Profesor *</Text>
          {teachers.length === 0 ? (
            <View className="bg-gray-900 rounded-xl px-4 py-3 mb-4">
              <Text className="text-gray-400">No hay usuarios con rol de profesor</Text>
              <Text className="text-gray-500 text-xs mt-2">
                Asigna el rol profesor a un usuario
              </Text>
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
            placeholder="Descripción"
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
            className="bg-primary rounded-2xl px-5 py-4 active:opacity-80 mb-4"
            onPress={handleUpdateCourse}
            disabled={teachers.length === 0}
          >
            <Text className="text-center font-semibold">Guardar cambios</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            className="bg-white rounded-2xl px-5 py-4 active:opacity-80 mb-4"
            onPress={() =>
              router.push(
                { pathname: "/private/admin/classes/new", params: { courseId: String(id) } } as Href
              )
            }
          >
            <Text className="text-center font-semibold">Crear clase</Text>
          </TouchableOpacity>

          {classes.map((cl) => (
            <View key={cl.id} className="bg-gray-900 rounded-2xl px-4 py-3 mb-3">
              <Text className="text-white font-semibold">
                {cl.title || `${cl.date} ${cl.startTime}-${cl.endTime}`}
              </Text>
              <Text className="text-gray-400">
                {cl.date && `Fecha: ${cl.date}`}
                {cl.room && ` • Sala: ${cl.room}`}
                {cl.capacity && ` • Cupo: ${cl.capacity}`}
              </Text>

              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  className="bg-white rounded-xl px-4 py-2"
                  onPress={() =>
                    router.push(
                      { pathname: "/private/admin/classes/[id]", params: { id: String(cl.id) } } as Href
                    )
                  }
                >
                  <Text className="font-semibold">Editar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      <View className="flex-row gap-2 mt-4">
        <TouchableOpacity
          className="bg-gray-700 rounded-2xl px-5 py-3"
          onPress={() => router.replace("/private/admin/coursesMenu")}
        >
          <Text className="text-center text-white font-semibold">Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-800 rounded-2xl px-5 py-3"
          onPress={() =>
            router.replace(
              showClassesTab
                ? ({ pathname: "/private/admin/courses/[id]", params: { id: String(id) } } as Href)
                : ({ pathname: "/private/admin/courses/[id]", params: { id: String(id), tab: "classes" } } as Href)
            )
          }
        >
          <Text className="text-center text-white font-semibold">
            {showClassesTab ? "Editar curso" : "Ver clases"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}