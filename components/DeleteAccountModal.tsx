import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const CONFIRM_TEXT = "Eliminar cuenta";

export const DeleteAccountModal = ({ visible, onClose, onConfirm }: Props) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedInput = input.trim().toLowerCase();
  const isValid = normalizedInput === CONFIRM_TEXT.toLowerCase();

  const handleDelete = async () => {
    if (!isValid) {
      setError(`Debes escribir exactamente "${CONFIRM_TEXT}"`);
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onConfirm();
      setInput("");
      onClose();
    } catch {
      setError("Ocurrió un error al eliminar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setInput("");
    setError("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-md rounded-2xl bg-white p-6">
          <Text className="mb-2 text-xl font-semibold text-gray-900">
            Eliminar cuenta
          </Text>

          <Text className="mb-4 text-sm leading-5 text-gray-600">
            Esta acción es permanente y no se puede deshacer. Para confirmar,
            escribe{" "}
            <Text className="font-semibold text-gray-900">
              &quot;{CONFIRM_TEXT}&quot;
            </Text>
            .
          </Text>

          <TextInput
            value={input}
            onChangeText={(text) => {
              setInput(text);
              if (error) setError("");
            }}
            placeholder='Escribe "Eliminar cuenta"'
            autoCapitalize="none"
            editable={!loading}
            className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
            placeholderTextColor="#9CA3AF"
          />

          {!!error && (
            <Text className="mt-2 text-sm text-red-600">{error}</Text>
          )}

          <View className="mt-6 flex-row items-center justify-end gap-3">
            <TouchableOpacity
              onPress={handleClose}
              disabled={loading}
              className="rounded-xl px-4 py-3"
            >
              <Text className="font-medium text-gray-700">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={!isValid || loading}
              className={`min-w-[120px] items-center rounded-xl px-4 py-3 ${
                !isValid || loading ? "bg-red-300" : "bg-red-600"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-semibold text-white">Eliminar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
