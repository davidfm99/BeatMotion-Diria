import DataLoader from "@/components/DataLoader";
import HeaderTitle from "@/components/headerTitle";
import VimeoVideoPlayer from "@/components/VimeoVideoPlayer";
import YouTubeVideoPlayer from "@/components/YoutubeVideoPlayer";
import {
  getEnrollmentColor,
  sanitizeVimeoUrl,
  sanitizeYouTubeUrl,
  statusTranslations,
} from "@/constants/helpers";
import { useAttendanceByUser } from "@/hooks/attendance/useAttendanceByUser";
import { useClassesByCourseId } from "@/hooks/classes/useClassesByCourseId";
import { useCourseDetail } from "@/hooks/courses/useCourseDetail";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CourseDetail = () => {
  const [classesOpen, setClassesOpen] = useState<string[]>();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { user: activeUser } = useActiveUser();
  const classesQuery = useClassesByCourseId(courseId as string);
  const attendanceQuery = useAttendanceByUser(activeUser?.uid || "", courseId);
  const courseDetailQuery = useCourseDetail(
    activeUser?.uid || "",
    courseId as string
  );

  const toggleClassOpen = (classId: string) => {
    setClassesOpen((prev) => {
      if (prev?.includes(classId)) {
        return prev.filter((id) => id !== classId);
      } else {
        return prev ? [...prev, classId] : [classId];
      }
    });
  };

  return (
    <SafeAreaView className="bg-gray-950 flex-1 p-5 ">
      <DataLoader
        query={courseDetailQuery}
        emptyMessage="Error al cargar detalles del curso. Por Favor, intentelo de nuevo"
      >
        {(course) => (
          <View className="flex-col gap-2">
            <HeaderTitle title={course?.title || ""} />
            <Text className="text-white text-lg mb-2">
              {course?.description}
            </Text>
            <Text className="text-gray-400 text-lg">
              Día del curso: {course?.day}
            </Text>
            <Text className="text-gray-400 text-lg">
              Nivel del curso: {course?.level}
            </Text>
            <Text className="text-gray-400 text-lg">
              Instructor : {course?.teacher}
            </Text>
            {course?.paymentStatus && (
              <Text className="text-gray-400 text-lg">
                Estado de Pago:{" "}
                <Text
                  className={`text-lg font-bold ${getEnrollmentColor(
                    course?.paymentStatus
                  )}`}
                >
                  {statusTranslations[course?.paymentStatus]}
                </Text>
              </Text>
            )}
            <Text className="text-gray-400 text-lg">
              Fecha de próximo pago:{" "}
              <Text className="text-yellow-400">
                {course?.nextPaymentDate
                  ? new Date(course?.nextPaymentDate).toLocaleDateString()
                  : "N/A"}
              </Text>
            </Text>
            <Text className="text-gray-400 text-lg">
              Número total de asistencias:{" "}
              <Text className="text-yellow-400 ml-3">
                {attendanceQuery.data?.filter((data) => data.attended).length ||
                  0}{" "}
                de {classesQuery.data?.length} clase(s)
              </Text>
            </Text>
            <View className="mt-4">
              <DataLoader
                query={classesQuery}
                emptyMessage="No se encontraron clases para este curso."
              >
                {(data) => (
                  <FlatList
                    data={data}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View className="mb-3" key={item.id}>
                        <Pressable
                          className="bg-gray-900 p-4 gap-2 rounded-2xl flex-row justify-between items-center"
                          onPress={() => toggleClassOpen(item.id)}
                        >
                          <View>
                            <Text className="text-white text-lg">
                              {item.title}
                            </Text>
                            <Text className="text-gray-500 text-lg">
                              {item.description}
                            </Text>
                            <Text className="text-gray-500 text-md">
                              {item.date}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-down"
                            size={24}
                            color="white"
                          />
                        </Pressable>
                        {classesOpen?.includes(item.id) && (
                          <ScrollView className="bg-gray-800 p-4 gap-3 rounded-2xl flex-1 overflow-x-auto h-64 ">
                            <Text className="text-gray-300">
                              {item.objectives}
                            </Text>
                            <Text className="text-gray-300">
                              {item.content}
                            </Text>
                            {item.videoLinks &&
                              item.videoLinks.length > 0 &&
                              item.videoLinks.map((link, index) => (
                                <View
                                  key={`${link.title}-${index}`}
                                  className="mt-3"
                                >
                                  {link.platform === "youtube" ? (
                                    <YouTubeVideoPlayer
                                      videoURL={
                                        sanitizeYouTubeUrl(link.url) || ""
                                      }
                                    />
                                  ) : (
                                    <VimeoVideoPlayer
                                      videoId={sanitizeVimeoUrl(link.url) || ""}
                                    />
                                  )}
                                </View>
                              ))}
                          </ScrollView>
                        )}
                      </View>
                    )}
                  />
                )}
              </DataLoader>
            </View>
          </View>
        )}
      </DataLoader>
    </SafeAreaView>
  );
};
export default CourseDetail;
