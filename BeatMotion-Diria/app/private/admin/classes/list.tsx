import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  where,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { router } from "expo-router";

export default function ClassesBrowserScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);

  // Cargar cursos
  useEffect(() => {
    const db = getFirestore();
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setCourses(arr);
      if (arr.length > 0 && !selectedCourseId) {
        setSelectedCourseId(arr[0].id);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setClasses([]);
      return;
    }
    const db = getFirestore();
    const q = query(
      collection(db, "classes"),
      where("courseId", "==", selectedCourseId),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: any[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setClasses(arr);
      },
      (err) => {
        console.error("Snapshot error (classes):", err);
        Alert.alert(
          "Clases",
          "No se pudieron cargar las clases. Si Firestore pide un índice (courseId + date), crea el índice en la consola de Firebase."
        );
      }
    );
    return () => unsub();
  }, [selectedCourseId]);

  const handleDeleteClass = (id: string) => {
    Alert.alert("Eliminar", "¿Seguro que quieres eliminar esta clase?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const db = getFirestore();
            await deleteDoc(doc(db, "classes", id));
          } catch (e) {
            console.error(e);
            Alert.alert("Error", "No se pudo eliminar la clase.");
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">Ver clases</Text>

      {courses.length === 0 ? (
        <Text className="text-gray-400 mb-4">
          No hay cursos. Crea un curso para ver sus clases.
        </Text>
      ) : (
        <>
          <Text className="text-white mb-2">Cursos:</Text>
          <FlatList
            horizontal
            data={courses}
            keyExtractor={(c) => c.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
            renderItem={({ item }) => {
              const active = item.id === selectedCourseId;
              return (
                <TouchableOpacity
                  className={`px-3 py-1 rounded-lg mr-2 border ${
                    active
                      ? "bg-white border-transparent"
                      : "bg-gray-800 border-gray-700"
                  }`}
                  onPress={() => setSelectedCourseId(item.id)}
                >
                  <Text
                    className={
                      active
                        ? "font-semibold text-black text-xs"
                        : "text-white text-xs"
                    }
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          <Text className="text-white mt-6 mb-2">
            Clases del curso seleccionado:
          </Text>
          {classes.length === 0 ? (
            <Text className="text-gray-400">
              No hay clases para este curso.
            </Text>
          ) : (
            <FlatList
              data={classes}
              keyExtractor={(it) => it.id}
              renderItem={({ item }) => (
                <View className="bg-gray-900 rounded-2xl px-3 py-2 mb-2">
                  <Text className="text-white font-semibold">
                    {item.title ?? `Clase ${item.date ?? ""}`}
                  </Text>
                  <Text className="text-gray-400">
                    {item.date ?? "—"} {item.startTime ?? ""}
                    {item.endTime ? `-${item.endTime}` : ""}
                  </Text>

                  <View className="flex-row gap-2 mt-2">
                    <TouchableOpacity
                      className="bg-white rounded-xl px-3 py-2"
                      onPress={() =>
                        router.push(`/private/admin/classes/${item.id}`)
                      }
                    >
                      <Text className="font-semibold">Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-red-500 rounded-xl px-3 py-2"
                      onPress={() => handleDeleteClass(item.id)}
                    >
                      <Text className="text-white font-semibold">Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </>
      )}

      <TouchableOpacity
        className="bg-gray-800 rounded-2xl px-5 py-3 mt-6"
        onPress={() => router.replace("/private/admin/coursesMenu")}
      >
        <Text className="text-center text-white font-semibold">Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
