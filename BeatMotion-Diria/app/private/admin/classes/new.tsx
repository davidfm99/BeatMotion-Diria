import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, Alert, ScrollView, View } from "react-native";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { router, useRootNavigationState } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function NewClassScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");           // guardamos YYYY-MM-DD
  const [startTime, setStartTime] = useState(""); // guardamos HH:mm (24h)
  const [endTime, setEndTime] = useState("");     // guardamos HH:mm (24h)
  const [room, setRoom] = useState("");
  const [capacity, setCapacity] = useState<string>("");

  // Pickers (UI)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Objetos Date solo para mostrar AM/PM y DD/MM/YYYY
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [startObj, setStartObj] = useState<Date | null>(null);
  const [endObj, setEndObj] = useState<Date | null>(null);

  // Navegación segura
  const navState = useRootNavigationState();
  const [pendingNav, setPendingNav] = useState(false);

  useEffect(() => {
    const db = getFirestore();
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setCourses(arr);
      if (arr.length > 0 && !courseId) setCourseId(arr[0].id);
    });
    return () => unsub();
  }, []);

  // Cuando el router está listo y tenemos navegación pendiente, navegamos
  useEffect(() => {
    if (pendingNav && navState?.key) {
      setPendingNav(false);
      router.replace("/private/admin/courses/index"); // o "/private/admin/coursesMenu"
    }
  }, [pendingNav, navState?.key]);

  // --- Helpers de formato ---
  function pad(n: number) {
    return n < 10 ? `0${n}` : String(n);
  }

  function formatYYYYMMDD(d: Date) {
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${y}-${m}-${day}`; // "2025-10-20"
  }

  function formatDDMMYYYY(d: Date) {
    const day = pad(d.getDate());
    const m = pad(d.getMonth() + 1);
    const y = d.getFullYear();
    return `${day}/${m}/${y}`; // "20/10/2025"
  }

  function to24h(d: Date) {
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${hh}:${mm}`; // "19:30"
  }

  function to12hLabel(d: Date) {
    let hours = d.getHours();
    const minutes = pad(d.getMinutes());
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`; // "7:30 PM"
  }

  const handleSave = async () => {
    if (!courseId) {
      Alert.alert("Clase", "Debes seleccionar un curso.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Clase", "El título es obligatorio.");
      return;
    }
    try {
      const db = getFirestore();
      await addDoc(collection(db, "classes"), {
        courseId,
        title: title.trim(),
        date: date.trim() || null,               // "2025-10-20"
        startTime: startTime.trim() || null,     // "19:00"
        endTime: endTime.trim() || null,         // "20:00"
        room: room.trim() || null,
        capacity: capacity ? Number(capacity) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Clase", "Creada correctamente.");
      // router.replace("/private/admin/courses/index"); // ❌ evitar navegar directo
      setPendingNav(true); // ✅ navega cuando el router esté listo
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo crear la clase.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">Nueva clase</Text>

      {courses.length === 0 ? (
        <>
          <Text className="text-gray-400 mb-4">
            No hay cursos disponibles. Crea un curso antes de crear una clase.
          </Text>
          <TouchableOpacity
            className="bg-white rounded-2xl px-5 py-4"
            onPress={() => router.push("/private/admin/courses/new")}
          >
            <Text className="text-center font-semibold">Ir a crear curso</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Curso */}
          <Text className="text-white mb-1">Curso</Text>
          <View className="bg-gray-900 rounded-xl mb-3">
            <Picker
              selectedValue={courseId}
              onValueChange={(v) => setCourseId(String(v))}
              dropdownIconColor="#ffffff"
              style={{ color: "white" }}
            >
              {courses.map((c) => (
                <Picker.Item key={c.id} label={c.title ?? "Sin título"} value={c.id} />
              ))}
            </Picker>
          </View>

          {/* Título */}
          <Text className="text-white mb-1">Título de la clase</Text>
          <TextInput
            className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-3"
            value={title}
            onChangeText={setTitle}
            placeholder="Clase 1"
            placeholderTextColor="#9CA3AF"
          />

          {/* Fecha (picker) */}
          <Text className="text-white mb-1">Fecha</Text>
          <TouchableOpacity
            className="bg-gray-900 rounded-xl px-3 py-3 mb-3"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-white">
              {dateObj ? formatDDMMYYYY(dateObj) : (date ? date : "Selecciona fecha")}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateObj ?? new Date()}
              mode="date"
              display="default"
              onChange={(_, sel) => {
                setShowDatePicker(false);
                if (!sel) return;
                setDateObj(sel);
                setDate(formatYYYYMMDD(sel)); // guardamos ISO
              }}
            />
          )}

          {/* Inicio (picker AM/PM) */}
          <Text className="text-white mb-1">Inicio</Text>
          <TouchableOpacity
            className="bg-gray-900 rounded-xl px-3 py-3 mb-3"
            onPress={() => setShowStartPicker(true)}
          >
            <Text className="text-white">
              {startObj ? to12hLabel(startObj) : (startTime ? startTime : "Selecciona hora")}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startObj ?? new Date()}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={(_, sel) => {
                setShowStartPicker(false);
                if (!sel) return;
                setStartObj(sel);
                setStartTime(to24h(sel)); // guardamos 24h
              }}
            />
          )}

          {/* Fin (picker AM/PM) */}
          <Text className="text-white mb-1">Fin</Text>
          <TouchableOpacity
            className="bg-gray-900 rounded-xl px-3 py-3 mb-3"
            onPress={() => setShowEndPicker(true)}
          >
            <Text className="text-white">
              {endObj ? to12hLabel(endObj) : (endTime ? endTime : "Selecciona hora")}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endObj ?? new Date()}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={(_, sel) => {
                setShowEndPicker(false);
                if (!sel) return;
                setEndObj(sel);
                setEndTime(to24h(sel)); // guardamos 24h
              }}
            />
          )}

          {/* Sala */}
          <Text className="text-white mb-1">Sala</Text>
          <TextInput
            className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-3"
            value={room}
            onChangeText={setRoom}
            placeholder="Sala 1"
            placeholderTextColor="#9CA3AF"
          />

          {/* Cupo */}
          <Text className="text-white mb-1">Cupo</Text>
          <TextInput
            className="bg-gray-900 text-white rounded-xl px-3 py-3 mb-6"
            value={capacity}
            onChangeText={setCapacity}
            placeholder="20"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
          />

          <TouchableOpacity className="bg-white rounded-2xl px-5 py-4" onPress={handleSave}>
            <Text className="text-center font-semibold">Guardar</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        className="bg-gray-800 rounded-2xl px-5 py-3 mt-6"
        onPress={() => router.replace("/private/admin/courses/index")}
      >
        <Text className="text-center text-white font-semibold">Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

