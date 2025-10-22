import { View, Text, TouchableHighlight } from "react-native";

const MyCourses = () => {
  return (
    <>
      <View className="flex-row justify-between">
        <Text className="text-white text-2xl font- w-auto font-extrabold">
          Mis Cursos
        </Text>
        <TouchableHighlight className="rounded-full px-3 py-3 self-end justify-center active:opacity-80 mb-5 flex-row gap-2 items-center">
          <>
            <Text className="text-primary gap-2 font-bold">Ver más</Text>
          </>
        </TouchableHighlight>
      </View>
      <View className="border rounded-md bg-slate-700 p-4">
        <Text className="text-gray-400">Aquí van los cursos del usuario.</Text>
      </View>
    </>
  );
};

export default MyCourses;
