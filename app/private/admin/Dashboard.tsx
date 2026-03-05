import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

import {
  useActiveStudents,
  useActiveTeachers,
  useCoursesCount,
  useClassesCount,
  useApprovedEnrollments,
} from "@/hooks/useDashboard";

const DashboardAdmin = () => {
  const { data: activeStudents } = useActiveStudents();
  const { data: activeTeachers } = useActiveTeachers();
  const { data: totalCourses } = useCoursesCount();
  const { data: totalClasses } = useClassesCount();
  const { data: approvedEnrollments } = useApprovedEnrollments();

  const stats = [
    {
      title: "Estudiantes Activos",
      value: activeStudents ?? 0,
      icon: "school",
      bg: "bg-blue-500",
    },
    {
      title: "Profesores Activos",
      value: activeTeachers ?? 0,
      icon: "person",
      bg: "bg-green-500",
    },
    {
      title: "Cursos",
      value: totalCourses ?? 0,
      icon: "menu-book",
      bg: "bg-purple-500",
    },
    {
      title: "Clases",
      value: totalClasses ?? 0,
      icon: "event",
      bg: "bg-orange-500",
    },
    {
      title: "Matrículas Aprobadas",
      value: approvedEnrollments ?? 0,
      icon: "check-circle",
      bg: "bg-teal-500",
    },
  ];

  return (
    <View className="p-4 gap-4">
      {stats.map((stat) => (
        <View
          key={stat.title}
          className={`flex-row items-center justify-between p-4 rounded-xl ${stat.bg} shadow-lg`}
        >
          <View className="flex-row items-center gap-4">
            <Icon name={stat.icon} size={32} color="#fff" />
            <View>
              <Text className="text-white font-bold text-lg">{stat.value}</Text>
              <Text className="text-white text-sm">{stat.title}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default DashboardAdmin;