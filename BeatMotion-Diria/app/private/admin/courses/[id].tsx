import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router, useRootNavigationState } from "expo-router";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, collection, query, where, onSnapshot } from "firebase/firestore";
import type { Href } from "expo-router";

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
  const [title, setTitle] = useState("");
  const [teacher, setTeacher] = useState("");
  const [level, setLevel] = useState("Inicial");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [classes, setClasses] = useState<any[]>([]);

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

  if (loading) {
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
          <TextInput
            className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-3"
            value={level}
            onChangeText={setLevel}
            placeholder="Inicial/Intermedio/Avanzado"
            placeholderTextColor="#9CA3AF"
          />

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
            className="bg-white rounded-2xl px-5 py-4 active:opacity-80 mb-4"
            onPress={handleUpdateCourse}
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
                {cl.date} {cl.startTime}-{cl.endTime}
              </Text>
              <Text className="text-gray-400">
                Sala: {cl.room ?? "—"} · Cupo: {cl.capacity ?? "—"}
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
          onPress={() => router.replace("/private/admin/courses/index")}
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
