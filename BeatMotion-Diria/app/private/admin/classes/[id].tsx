import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { doc, getDoc, updateDoc, deleteDoc, getFirestore, serverTimestamp } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

type VideoLink = {
  id: string;
  url: string;
  platform: 'youtube' | 'vimeo';
  title?: string;
};

export default function EditClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [objectives, setObjectives] = useState("");
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [startObj, setStartObj] = useState<Date | null>(null);
  const [endObj, setEndObj] = useState<Date | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const db = getFirestore();
      const snap = await getDoc(doc(db, "classes", id!));
      
      if (!snap.exists()) {
        Alert.alert("Clase", "No encontrada");
        router.back();
        return;
      }
      
      const data = snap.data();
      setCourseId(data.courseId ?? "");
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setContent(data.content ?? "");
      setObjectives(data.objectives ?? "");
      setDate(data.date ?? "");
      setStartTime(data.startTime ?? "");
      setEndTime(data.endTime ?? "");
      setCapacity(data.capacity ? String(data.capacity) : "");
      
      if (data.date) {
        try {
          const [year, month, day] = data.date.split('-');
          setDateObj(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
        } catch (e) {
          console.error("Error parsing date:", e);
        }
      }
      
      if (data.startTime) {
        try {
          const [hours, minutes] = data.startTime.split(':');
          const d = new Date();
          d.setHours(parseInt(hours), parseInt(minutes));
          setStartObj(d);
        } catch (e) {
          console.error("Error parsing start time:", e);
        }
      }
      
      if (data.endTime) {
        try {
          const [hours, minutes] = data.endTime.split(':');
          const d = new Date();
          d.setHours(parseInt(hours), parseInt(minutes));
          setEndObj(d);
        } catch (e) {
          console.error("Error parsing end time:", e);
        }
      }
      
      if (data.videoLinks && Array.isArray(data.videoLinks)) {
        const videos = data.videoLinks.map((v: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          url: v.url || "",
          platform: v.platform || 'youtube',
          title: v.title || undefined,
        }));
        setVideoLinks(videos);
      }
      
      setLoading(false);
    };
    if (id) load();
  }, [id]);

  function pad(n: number) {
    return n < 10 ? `0${n}` : String(n);
  }

  function formatYYYYMMDD(d: Date) {
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${y}-${m}-${day}`;
  }

  function formatDDMMYYYY(d: Date) {
    const day = pad(d.getDate());
    const m = pad(d.getMonth() + 1);
    const y = d.getFullYear();
    return `${day}/${m}/${y}`;
  }

  function to24h(d: Date) {
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${hh}:${mm}`;
  }

  function to12hLabel(d: Date) {
    let hours = d.getHours();
    const minutes = pad(d.getMinutes());
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  const detectPlatform = (url: string): 'youtube' | 'vimeo' | null => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    return null;
  };

  const addVideoLink = () => {
    if (!newVideoUrl.trim()) {
      Alert.alert("Video", "Debes ingresar una URL.");
      return;
    }

    const platform = detectPlatform(newVideoUrl);
    if (!platform) {
      Alert.alert("Video", "Solo se permiten enlaces de YouTube o Vimeo.");
      return;
    }

    const newVideo: VideoLink = {
      id: Date.now().toString(),
      url: newVideoUrl.trim(),
      platform,
      title: newVideoTitle.trim() || undefined,
    };

    setVideoLinks([...videoLinks, newVideo]);
    setNewVideoUrl("");
    setNewVideoTitle("");
  };

  const removeVideoLink = (id: string) => {
    setVideoLinks(videoLinks.filter(v => v.id !== id));
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Clase", "El título es obligatorio.");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Clase", "El contenido es obligatorio.");
      return;
    }

    try {
      const db = getFirestore();
      await updateDoc(doc(db, "classes", id!), {
        title: title.trim(),
        description: description.trim() || null,
        content: content.trim(),
        objectives: objectives.trim() || null,
        date: date.trim() || null,
        startTime: startTime.trim() || null,
        endTime: endTime.trim() || null,
        capacity: capacity ? Number(capacity) : null,
        videoLinks: videoLinks.map(v => ({
          url: v.url,
          platform: v.platform,
          title: v.title || null,
        })),
        updatedAt: serverTimestamp(),
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
            const db = getFirestore();
            await deleteDoc(doc(db, "classes", id!));
            Alert.alert("Clase", "Eliminada correctamente.");
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
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-white text-2xl font-bold">Editar clase</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text className="text-white mb-2 font-semibold">Título de la clase *</Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-4"
        value={title}
        onChangeText={setTitle}
        placeholder="Clase 1"
        placeholderTextColor="#9CA3AF"
      />

      {/* Date and time */}
      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <Text className="text-white font-semibold mb-3">Información de sesión</Text>
        
        {/* Date */}
        <Text className="text-gray-300 mb-2 text-sm">Fecha de la clase</Text>
        <TouchableOpacity
          className="bg-gray-900 rounded-xl px-4 py-3 mb-3 flex-row items-center justify-between"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-white">
            {dateObj ? formatDDMMYYYY(dateObj) : (date ? date : "Selecciona fecha")}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
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
              setDate(formatYYYYMMDD(sel));
            }}
          />
        )}

        {/* Start class */}
        <Text className="text-gray-300 mb-2 text-sm">Hora de inicio</Text>
        <TouchableOpacity
          className="bg-gray-900 rounded-xl px-4 py-3 mb-3 flex-row items-center justify-between"
          onPress={() => setShowStartPicker(true)}
        >
          <Text className="text-white">
            {startObj ? to12hLabel(startObj) : (startTime ? startTime : "Selecciona hora")}
          </Text>
          <Ionicons name="time-outline" size={20} color="#9CA3AF" />
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
              setStartTime(to24h(sel));
            }}
          />
        )}

        {/* End class */}
        <Text className="text-gray-300 mb-2 text-sm">Hora de finalización</Text>
        <TouchableOpacity
          className="bg-gray-900 rounded-xl px-4 py-3 mb-3 flex-row items-center justify-between"
          onPress={() => setShowEndPicker(true)}
        >
          <Text className="text-white">
            {endObj ? to12hLabel(endObj) : (endTime ? endTime : "Selecciona hora")}
          </Text>
          <Ionicons name="time-outline" size={20} color="#9CA3AF" />
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
              setEndTime(to24h(sel));
            }}
          />
        )}

        {/* Capcity */}
        <Text className="text-gray-300 mb-2 text-sm">Capacidad máxima</Text>
        <TextInput
          className="bg-gray-900 text-white rounded-xl px-4 py-3"
          value={capacity}
          onChangeText={setCapacity}
          placeholder="Ej: 20"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
        />
      </View>

      {/* Description */}
      <Text className="text-white mb-2 font-semibold">Descripción breve</Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-4"
        value={description}
        onChangeText={setDescription}
        placeholder="Resume en pocas palabras de qué trata esta clase"
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={2}
      />

      {/* Objectives */}
      <Text className="text-white mb-2 font-semibold">Objetivos de aprendizaje</Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-4 min-h-24"
        value={objectives}
        onChangeText={setObjectives}
        placeholder="¿Qué aprenderán los estudiantes en esta clase?"
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
      />

      {/* Content */}
      <Text className="text-white mb-2 font-semibold">Contenido de la clase *</Text>
      <Text className="text-gray-400 text-xs mb-2">
        Escribe todo el material educativo, explicaciones, pasos a seguir, etc.
      </Text>
      <TextInput
        className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-4 min-h-48"
        value={content}
        onChangeText={setContent}
        placeholder="Escribe aquí todo el contenido que quieres compartir con los estudiantes..."
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
      />

      {/* Videos */}
      <View className="mb-4">
        <Text className="text-white mb-2 font-semibold">Videos (YouTube/Vimeo)</Text>
        
        {/* List of videos */}
        {videoLinks.map((video) => (
          <View key={video.id} className="bg-gray-900 rounded-xl p-3 mb-2 flex-row items-center">
            <Ionicons 
              name={video.platform === 'youtube' ? 'logo-youtube' : 'logo-vimeo'} 
              size={24} 
              color={video.platform === 'youtube' ? '#FF0000' : '#1AB7EA'} 
            />
            <View className="flex-1 ml-3">
              {video.title && (
                <Text className="text-white font-semibold text-sm">{video.title}</Text>
              )}
              <Text className="text-gray-400 text-xs" numberOfLines={1}>
                {video.url}
              </Text>
            </View>
            <TouchableOpacity onPress={() => removeVideoLink(video.id)} className="ml-2">
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add new video */}
        <View className="bg-gray-900 rounded-xl p-4 mb-2">
          <TextInput
            className="bg-gray-800 text-white rounded-xl px-3 py-2 mb-2"
            value={newVideoTitle}
            onChangeText={setNewVideoTitle}
            placeholder="Título del video (opcional)"
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            className="bg-gray-800 text-white rounded-xl px-3 py-2 mb-3"
            value={newVideoUrl}
            onChangeText={setNewVideoUrl}
            placeholder="https://youtube.com/... o https://vimeo.com/..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="url"
          />
          <TouchableOpacity
            className="bg-secondary rounded-xl px-4 py-2 flex-row items-center justify-center"
            onPress={addVideoLink}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Agregar video</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action botton */}
      <View className="gap-3">
        <TouchableOpacity 
          className="bg-primary rounded-2xl px-5 py-4" 
          onPress={handleUpdate}
        >
          <Text className="text-center font-semibold text-base">Guardar cambios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-500 rounded-2xl px-5 py-4"
          onPress={handleDelete}
        >
          <Text className="text-center font-semibold text-white">Eliminar clase</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-800 rounded-2xl px-5 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-center text-white font-semibold">Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}