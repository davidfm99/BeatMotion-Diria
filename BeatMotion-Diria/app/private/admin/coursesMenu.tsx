import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useCourses } from "@/hooks/courses/useCourses";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import DataLoader from "@/components/DataLoader";
import type { Href } from "expo-router";

type ClassItem = {
  id: string;
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  capacity?: number;
};

export default function CoursesMenuScreen() {
  const coursesQuery = useCourses();
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [classesByCourse, setClassesByCourse] = useState<Record<string, ClassItem[]>>({});

  useEffect(() => {
    if (!coursesQuery.data) return;

    const unsubscribers: (() => void)[] = [];

    coursesQuery.data.forEach((course) => {
      const q = query(
        collection(firestore, "classes"),
        where("courseId", "==", course.id)
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const classes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ClassItem[];

        setClassesByCourse((prev) => ({
          ...prev,
          [course.id]: classes,
        }));
      });

      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [coursesQuery.data]);

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleDeleteCourse = (courseId: string, courseName: string) => {
    Alert.alert(
      "Eliminar curso",
      `¿Estás seguro de eliminar "${courseName}"? Esto también eliminará todas sus clases.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, "courses", courseId));
              Alert.alert("Éxito", "Curso eliminado correctamente");
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "No se pudo eliminar el curso");
            }
          },
        },
      ]
    );
  };

  const handleDeleteClass = (classId: string, className: string) => {
    Alert.alert(
      "Eliminar clase",
      `¿Estás seguro de eliminar "${className}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, "classes", classId));
              Alert.alert("Éxito", "Clase eliminada correctamente");
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "No se pudo eliminar la clase");
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 pt-10 pb-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold">
            Gestión de cursos
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            Cursos y clases
          </Text>
        </View>
        <TouchableOpacity
          className="bg-gray-900 rounded-full p-3"
          onPress={() => router.push("/private/home")}
          accessibilityLabel="Volver al inicio"
        >
          <Ionicons name="home-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View className="px-6 pb-4 flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-primary rounded-2xl px-4 py-3 flex-row items-center justify-center gap-2"
          onPress={() => router.push("/private/admin/courses/new")}
        >
          <Ionicons name="add-circle-outline" size={20} color="black" />
          <Text className="font-semibold">Nuevo Curso</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-secondary rounded-2xl px-4 py-3 flex-row items-center justify-center gap-2"
          onPress={() => router.push("/private/admin/classes/new")}
        >
          <Ionicons name="calendar-outline" size={20} color="white" />
          <Text className="font-semibold text-white">Nueva Clase</Text>
        </TouchableOpacity>
      </View>

      {/* Hierarchical List */}
      <DataLoader query={coursesQuery} emptyMessage="No hay cursos creados aún">
        {(courses) => (
          <ScrollView className="flex-1 px-6">
            {courses.map((course) => {
              const isExpanded = expandedCourses.has(course.id);
              const classes = classesByCourse[course.id] || [];

              return (
                <View key={course.id} className="mb-3">
                  {/* Course Item */}
                  <View className="bg-gray-900 rounded-2xl overflow-hidden">
                    <TouchableOpacity
                      className="p-4 flex-row items-center"
                      onPress={() => toggleCourse(course.id)}
                      activeOpacity={0.7}
                    >
                      <View className="mr-3">
                        <Ionicons
                          name={isExpanded ? "folder-open" : "folder"}
                          size={24}
                          color="#40E0D0"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-semibold text-base">
                          {course.title}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                          {course.teacher} • {course.level} • {classes.length} clase(s)
                        </Text>
                      </View>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          className="bg-gray-800 rounded-full p-2"
                          onPress={() =>
                            router.push({
                              pathname: "/private/admin/courses/[id]",
                              params: { id: course.id },
                            } as Href)
                          }
                        >
                          <Ionicons name="create-outline" size={18} color="#40E0D0" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-gray-800 rounded-full p-2"
                          onPress={() => handleDeleteCourse(course.id, course.title)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          color="#9CA3AF"
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Classes (expanded) */}
                    {isExpanded && (
                      <View className="bg-gray-950 px-4 pb-2">
                        {classes.length === 0 ? (
                          <View className="py-4 items-center">
                            <Text className="text-gray-500 text-sm">
                              No hay clases en este curso
                            </Text>
                            <TouchableOpacity
                              className="mt-2 bg-secondary rounded-full px-4 py-2"
                              onPress={() =>
                                router.push({
                                  pathname: "/private/admin/classes/new",
                                  params: { courseId: course.id },
                                } as Href)
                              }
                            >
                              <Text className="text-white text-xs font-semibold">
                                Crear primera clase
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          classes.map((classItem) => (
                            <View
                              key={classItem.id}
                              className="flex-row items-center py-3 border-t border-gray-800"
                            >
                              <View className="mr-3">
                                <Ionicons
                                  name="document-text-outline"
                                  size={20}
                                  color="#55B4B0"
                                />
                              </View>
                              <View className="flex-1">
                                <Text className="text-white text-sm">
                                  {classItem.title || classItem.date || "Sin título"}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-0.5">
                                  {classItem.date} • {classItem.startTime}-{classItem.endTime}
                                  {classItem.room && ` • ${classItem.room}`}
                                </Text>
                              </View>
                              <View className="flex-row gap-2">
                                <TouchableOpacity
                                  className="bg-gray-800 rounded-full p-1.5"
                                  onPress={() =>
                                    router.push({
                                      pathname: "/private/admin/classes/[id]",
                                      params: { id: classItem.id },
                                    } as Href)
                                  }
                                >
                                  <Ionicons name="create-outline" size={16} color="#40E0D0" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  className="bg-gray-800 rounded-full p-1.5"
                                  onPress={() =>
                                    handleDeleteClass(
                                      classItem.id,
                                      classItem.title || classItem.date || "esta clase"
                                    )
                                  }
                                >
                                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </DataLoader>
    </View>
  );
}