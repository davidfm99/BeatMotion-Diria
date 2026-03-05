import { Button, View, Text } from "react-native";
import { useState, useEffect } from "react";

const LogIn = () => {
  const [count, setCount] = useState({ name: "Andrea", age: 19 });
  const suma = () => {
    setCount({ ...count, age: count.age + 2 });
  };

  useEffect(() => {
    // Aquí puedes realizar efectos secundarios basados en los cambios de "count"
  }, []);

  return (
    <View>
      <Text className="text-lg font-bold text-white">Iniciar sesión</Text>
      <Button title="Ingresar" onPress={suma} />
    </View>
  );
};

export default LogIn;
