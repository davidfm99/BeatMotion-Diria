import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, ScrollView } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useActiveUser } from "@/hooks/user/UseActiveUser";

type StudentProgress = {
  uid: string;
  name: string;
  classesCompleted: number;
  progress: number;
  level: number;
  createdAt: Date;
};

export default function DataUsersComparison() {
  const { user } = useActiveUser();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [progressData, setProgressData] = useState<number[]>([]);

  const screenWidth = Dimensions.get("window").width;
  const db = getFirestore();

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchStudents = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const userProgressSnap = await getDocs(collection(db, "userprogress"));

        const data: StudentProgress[] = [];

        usersSnap.forEach((uDoc) => {
          if (uDoc.data().role === "user") {
            const progressDoc = userProgressSnap.docs.find((p) => p.id === uDoc.id);
            const createdAt = uDoc.data().createdAt ? uDoc.data().createdAt.toDate() : new Date();

            data.push({
              uid: uDoc.id,
              name: uDoc.data().name,
              classesCompleted: progressDoc?.data().classesCompleted || 0,
              progress: progressDoc?.data().progress || 0,
              level: progressDoc?.data().level || 1,
              createdAt,
            });
          }
        });

        setStudents(data);
        setLabels(data.map((s) => s.name));
        setProgressData(data.map((s) => s.progress));
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, [user]);

  const calculateMonthsSince = (createdAt: Date) => {
    const today = new Date();
    return (today.getFullYear() - createdAt.getFullYear()) * 12 + (today.getMonth() - createdAt.getMonth());
  };

  return (
    <ScrollView className="flex-1 bg-black px-4 py-6">
      <Text className="text-white text-2xl font-bold mb-6">
        Comparación de Estudiantes
      </Text>

      {/* Gráfico de barras horizontal scrollable */}
     <ScrollView horizontal showsHorizontalScrollIndicator>
  <View style={{ backgroundColor: "#212423", borderRadius: 16 }}>
    <BarChart
      data={{
        labels,
        datasets: [{ data: progressData }],
      }}
      width={Math.max(screenWidth, labels.length * 80)} // Ancho dinámico
      height={300}
      yAxisLabel=""
      yAxisSuffix="%"
      fromZero
      showValuesOnTopOfBars
      verticalLabelRotation={45}
      chartConfig={{
        backgroundColor: "#212423", // este solo afecta la parte interna del gráfico
        backgroundGradientFrom: "#212423", // igual que el contenedor
        backgroundGradientTo: "#212423",   // igual que el contenedor
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
        labelColor: () => "#fff",
        barPercentage: 0.5,
        fillShadowGradient: "#00e0ff",
        fillShadowGradientOpacity: 1,
      }}
      style={{ borderRadius: 16 }}
    />
  </View>
</ScrollView>

      {/* Tabla comparativa scrollable */}
<Text className="text-white text-2xl font-bold mb-4">
</Text>


<Text className="text-white text-2xl font-bold mb-4">
  Cuadro Comparativo
</Text>

<ScrollView horizontal showsHorizontalScrollIndicator className="mb-10">
  <View className="bg-gray-900 rounded-2xl p-4 min-w-[650px]">
    {/* Encabezados */}
    <View className="flex-row border-b border-gray-700 pb-2">
      <Text style={{ width: 150, color: "#fff", fontWeight: "bold" }}>Nombre</Text>
      <Text style={{ width: 80, color: "#fff", fontWeight: "bold" }}>Clases</Text>
      <Text style={{ width: 80, color: "#fff", fontWeight: "bold" }}>Progreso</Text>
      <Text style={{ width: 80, color: "#fff", fontWeight: "bold" }}>Nivel</Text>
      <Text style={{ width: 120, color: "#fff", fontWeight: "bold" }}>Meses inscrito</Text>
    </View>

    {/* Filas de datos */}
    {students.map((s) => (
      <View key={s.uid} className="flex-row py-2 border-b border-gray-800">
        <Text style={{ width: 150, color: "#fff" }}>{s.name}</Text>
        <Text style={{ width: 80, color: "#fff" }}>{s.classesCompleted}</Text>
        <Text style={{ width: 80, color: "#fff" }}>{s.progress}%</Text>
        <Text style={{ width: 80, color: "#fff" }}>{s.level}</Text>
        <Text style={{ width: 120, color: "#fff" }}>{calculateMonthsSince(s.createdAt)}</Text>
      </View>
    ))}
  </View>
</ScrollView>
    </ScrollView>
  );
}
