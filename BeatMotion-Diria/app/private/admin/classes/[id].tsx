import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getClassDetail, updateClassDetail, deleteClassDetail } from "@/services/catalog";

export default function EditClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [capacity, setCapacity] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getClassDetail(id!);
      if (!data) {
        Alert.alert("Clase", "No encontrada");
        router.back();
        return;
      }
      setCourseId(data.courseId ?? "");
      setDate(data.date ?? "");
      setStartTime(data.startTime ?? "");
      setEndTime(data.endTime ?? "");
      setRoom(data.room ?? "");
      setCapacity(data.capacity ? String(data.capacity) : "");
      setLoading(false);
    };
    if (id) load();
  }, [id]);

  const handleUpdate = async () => {
    try {
      await updateClassDetail(id!, {
        courseId: courseId.trim(),
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        room: room.trim(),
        capacity: capacity ? Number(capacity) : undefined,
      });
      Alert.alert("Clase", "Actualizada correctamente.");
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo actualizar la clase.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Eliminar", "¿Seguro que quieres eliminar esta clase?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClassDetail(id!);
            router.back();
          } catch (e) {
            console.error(e);
            Alert.alert("Error", "No se pudo eliminar la clase.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">Editar clase</Text>

      <Text className="text-white mb-1">Curso (ID)</Text>
      <TextInput className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-3"
        value={courseId} onChangeText={setCourseId} placeholder="ID del curso" placeholderTextColor="#9CA3AF" />

      <Text className="text-white mb-1">Fecha (YYYY-MM-DD)</Text>
      <TextInput className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-3"
        value={date} onChangeText={setDate} placeholder="2025-10-20" placeholderTextColor="#9CA3AF" />

      <Text className="text-white mb-1">Inicio (HH:mm)</Text>
      <TextInput className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-3"
        value={startTime} onChangeText={setStartTime} placeholder="19:00" placeholderTextColor="#9CA3AF" />

      <Text className="text-white mb-1">Fin (HH:mm)</Text>
      <TextInput className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-3"
        value={endTime} onChangeText={setEndTime} placeholder="20:00" placeholderTextColor="#9CA3AF" />

      <Text className="text-white mb-1">Sala</Text>
      <TextInput className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-3"
        value={room} onChangeText={setRoom} placeholder="Sala 1" placeholderTextColor="#9CA3AF" />

      <Text className="text-white mb-1">Cupo</Text>
      <TextInput className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-6"
        value={capacity} onChangeText={setCapacity} placeholder="20" placeholderTextColor="#9CA3AF" keyboardType="number-pad" />

      <View className="gap-3">
        <TouchableOpacity className="bg-white rounded-2xl px-5 py-4" onPress={handleUpdate}>
          <Text className="text-center font-semibold">Guardar cambios</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-red-500 rounded-2xl px-5 py-4" onPress={handleDelete}>
          <Text className="text-center font-semibold text-white">Eliminar clase</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
