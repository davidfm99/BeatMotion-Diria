import DataLoader from "@/components/DataLoader";
import HeaderTitle from "@/components/headerTitle";
import { useMembersByCourse } from "@/hooks/courseMember/useMembersByCourse";
import { useLocalSearchParams } from "expo-router/build/hooks";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const Attendance = () => {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const membersQuery = useMembersByCourse(classId);

  return (
    <SafeAreaView>
      <HeaderTitle title="Registro de asistencia" />
      <DataLoader
        query={membersQuery}
        emptyMessage="No hay estudiantes registrados en este curso"
      >
        {(data) => (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BouncyCheckbox
                size={25}
                fillColor="turquoise"
                text={item.userInfo.fullName}
              />
            )}
          />
        )}
      </DataLoader>
    </SafeAreaView>
  );
};

export default Attendance;
