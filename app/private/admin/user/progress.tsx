import { View, Text, ScrollView, Dimensions, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { BarChart } from "react-native-chart-kit";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useActiveUser } from "@/hooks/user/UseActiveUser";

export default function UserProgressScreen() {
  const { uid } = useLocalSearchParams();
  const { user } = useActiveUser(); 
  const [userData, setUserData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  useEffect(() => {
    if (!uid || !user) return;

    // Convertir uid a string si es un arreglo
    const targetUid = Array.isArray(uid) ? uid[0] : uid;

    const fetchData = async () => {
      try {
        // Validar que el admin exista y sea admin
        const adminRef = doc(db, "users", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists() || adminSnap.data().role !== "admin") {
          Alert.alert("Acceso denegado", "No tienes permisos para ver el progreso");
          return;
        }

        // Obtener datos del usuario
        const userRef = doc(db, "users", targetUid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUserData(userSnap.data());

        // Obtener progreso del usuario
        const progressRef = doc(db, "userprogress", targetUid);
        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
          setProgressData(progressSnap.data());
        } else {
          setProgressData({
            level: 1,
            classesCompleted: 0,
            totalClasses: 0,
            progress: 0,
            monthlyProgress: [0, 0, 0, 0, 0, 0],
          });
        }

      } catch (err) {
        console.error("Error cargando datos:", err);
        Alert.alert("Error", "No se pudo cargar el progreso del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid, user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Cargando progreso...</Text>
      </View>
    );
  }

  if (!userData || !progressData) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">No se pudo cargar el progreso</Text>
      </View>
    );
  }

  // --- Datos calculados ---
  const TOTAL_CLASSES = progressData.totalClasses || 10;
  const classesCompleted = progressData.classesCompleted || 0;
  const progress = progressData.progress || Math.round((classesCompleted / TOTAL_CLASSES) * 100);
  const level = progressData.level || 1;
  const monthlyProgress = progressData.monthlyProgress || [0, 0, 0, 0, 0, 0];

  const screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6">
        Progreso de {userData.name}
      </Text>

      {/* Indicador circular */}
      <View className="items-center mb-10">
        <AnimatedCircularProgress
          size={160}
          width={14}
          fill={progress}
          tintColor="#00e0ff"
          backgroundColor="#3d5875"
        >
          {(fill: number) => (
            <Text className="text-white text-xl font-bold">{Math.round(fill)}%</Text>
          )}
        </AnimatedCircularProgress>
        <Text className="text-gray-300 mt-3">Avance total</Text>
      </View>

      {/* Información general */}
      <View className="bg-gray-900 p-5 rounded-2xl mb-10">
        <Text className="text-white text-lg font-semibold mb-2">Información general</Text>
        <Text className="text-gray-300">Nivel alcanzado: {level}</Text>
        <Text className="text-gray-300">Clases completadas: {classesCompleted}</Text>
        <Text className="text-gray-300">Total clases: {TOTAL_CLASSES}</Text>
      </View>

      {/* Gráfico de progreso mensual */}
      <Text className="text-white text-lg font-semibold mb-3">Progreso mensual</Text>

      <BarChart
        data={{
          labels: ["Agos", "Sep", "Oct", "Nov", "Dic"],
          datasets: [{ data: monthlyProgress }],
        }}
        width={screenWidth - 50}
        height={260}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: "#000",
          backgroundGradientFrom: "#222",
          backgroundGradientTo: "#000",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
          labelColor: () => "#fff",
          barPercentage: 0.6,
        }}
        style={{ borderRadius: 20 }}
      />
    </ScrollView>
  );
}
