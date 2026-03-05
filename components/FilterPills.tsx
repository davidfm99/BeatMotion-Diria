import { Pressable, Text, View } from "react-native";

type FilterPillsProps = {
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  selected: string;
};

const FilterPills = ({ options, onSelect, selected }: FilterPillsProps) => {
  return (
    <View className="flex-row mb-4 gap-3">
      {options.map((option) => (
        <Pressable key={option.value} onPress={() => onSelect?.(option.value)}>
          <View
            key={option.value}
            className={` px-3 py-2 rounded-full ${
              selected === option.value ? "bg-secondary" : "bg-gray-800"
            }`}
          >
            <Text className="text-white">{option.label}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

export default FilterPills;
