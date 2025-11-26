import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Text, TouchableHighlight, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MyCourses from "./myCourses";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { useCourseMemberByUser } from "@/hooks/courseMember/useCourseMemberByUser";
import { useAvailableSurveys } from "@/hooks/surveys/useSurveys";

const HomeUser = () => {
  const router = useRouter();
  const { user } = useActiveUser();

  const courseMemberQuery = useCourseMemberByUser(user?.uid || "");
  const courseIds = courseMemberQuery.data?.map((cm) => cm.courseId) || [];
  const surveysQuery = useAvailableSurveys(user?.uid || "", courseIds);
  const pendingSurveys = surveysQuery.data?.length || 0;

  const handleClickEnroll = () => {
    router.push("/private/user/enrollment/createEnrollment");
  };

  const handleOpenMarketplace = () => {
    router.push("/private/marketplace/MarketplaceList" as Href);
  };

  const handleOpenSurveys = () => {
    router.push("/private/user/surveys/list" as Href);
  };

  return (
    <View>
      <TouchableHighlight
        className="bg-primary self-end text-gray-950 w-1/2 rounded-full px-3 py-3  justify-center active:opacity-80 mb-8 flex-row gap-2 items-center"
        onPress={handleClickEnroll}
      >
        <>
          <Icon name="add-circle-outline" size={20} />
          <Text className="text-white gap-2 font-bold">Matricular Curso</Text>
        </>
      </TouchableHighlight>
      <TouchableHighlight
        className="bg-yellow-400 self-end text-white w-1/2 rounded-full px-3 py-3 justify-center active:opacity-80 mb-8 flex-row gap-2 items-center"
        onPress={handleOpenMarketplace}
      >
        <>
          <Icon name="bag-outline" size={20} color="black" />
          <Text className="text-black gap-2 font-bold">Ver Tienda</Text>
        </>
      </TouchableHighlight>

      <View className="relative self-end w-1/2 mb-8">
        <TouchableHighlight
          className="bg-secondary text-white rounded-full px-3 py-3 justify-center active:opacity-80 flex-row gap-2 items-center"
          onPress={handleOpenSurveys}
        >
          <View className="flex-row gap-2 items-center">
            <Icon name="create-outline" size={20} color="white" />
            <Text className="text-white gap-2 font-bold">
              Responder Encuestas
            </Text>
          </View>
        </TouchableHighlight>

        {/* Badge de encuestas pendientes */}
        {pendingSurveys > 0 && (
          <View 
            className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
            style={{ position: 'absolute', top: -8, right: -8 }}
          >
            <Text className="text-white text-xs font-bold">
              {pendingSurveys}
            </Text>
          </View>
        )}
      </View>

      <MyCourses />
    </View>
  );
};

export default HomeUser;
