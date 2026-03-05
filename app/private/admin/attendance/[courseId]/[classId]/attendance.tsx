import DataLoader from "@/components/DataLoader";
import HeaderTitle from "@/components/headerTitle";
import { useAttendanceInfo } from "@/hooks/attendance/useAttendanceInfo";
import { useUpsertAttendance } from "@/hooks/attendance/useUpsertAttendance";
import { useMembersByCourse } from "@/hooks/courseMember/useMembersByCourse";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";

type AttendanceProps = {
  classId: string;
  courseId: string;
};

type ListUsers = {
  id?: string;
  userId: string;
  attended: boolean;
  createdAt?: any;
};

const Attendance = () => {
  const queryClient = useQueryClient();
  const [attendancePerUser, SetAttendancePerUser] = useState<ListUsers[]>([]);
  const { classId, courseId } = useLocalSearchParams<AttendanceProps>();
  const updateAttendance = useUpsertAttendance();
  const attendanceQuery = useAttendanceInfo(classId);
  const membersQuery = useMembersByCourse(courseId);

  useEffect(() => {
    if (attendanceQuery.data && attendanceQuery.data?.length > 0) {
      const newAssitance = attendanceQuery.data.map((member) => member);
      SetAttendancePerUser(newAssitance);
    }
  }, [attendanceQuery.data]);

  const handleMarkStudent = (userId: string, isChecked: boolean) => {
    const userToSave = attendancePerUser.find((att) => att.userId === userId);
    if (!userToSave) {
      attendancePerUser.push({ userId: userId, attended: isChecked });
    } else {
      SetAttendancePerUser((prev) =>
        prev.map((att) =>
          att.userId === userId ? { ...att, attended: isChecked } : att,
        ),
      );
    }
  };

  const handleUpdateAssitance = () => {
    const attendance = attendancePerUser.map((att) => ({
      id: att.id || "",
      userId: att.userId,
      classId,
      courseId,
      attended: att.attended,
      createdAt: att.createdAt || null,
    }));
    updateAttendance.mutate(attendance);
    queryClient.invalidateQueries({ queryKey: ["attendanceInfo", classId] });
  };

  return (
    <SafeAreaView>
      <HeaderTitle title="Registro de asistencia" />
      <DataLoader
        query={membersQuery}
        emptyMessage="No hay estudiantes registrados en este curso"
      >
        {(data, isRefreching, refrecht) => (
          <FlatList
            ListHeaderComponent={
              <Text className="text-white text-xl px-6 mb-4 font-bold">
                Usuarios del Curso:
              </Text>
            }
            refreshControl={
              <RefreshControl refreshing={isRefreching} onRefresh={refrecht} />
            }
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="px-10 py-4 bg-gray-900 border rounded-xl mb-4">
                <BouncyCheckbox
                  isChecked={
                    attendancePerUser.find((att) => att.userId === item.userId)
                      ?.attended || false
                  }
                  onPress={(isChecked) =>
                    handleMarkStudent(item.userId, isChecked)
                  }
                  fillColor="turquoise"
                  textComponent={
                    <Text className="text-white font-semibold text-lg ml-4">
                      {item.userInfo.fullName}
                    </Text>
                  }
                />
              </View>
            )}
          />
        )}
      </DataLoader>
      <View className="items-center flex aboslute">
        <Pressable
          className="bg-primary rounded-xl  :active=bg-secondary :active=text-white  p-5 w-1/2"
          onPress={handleUpdateAssitance}
        >
          <Text className="font-bold text-gray-800 text-center">
            Guardar asistencia
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Attendance;
