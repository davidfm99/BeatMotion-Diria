import { string } from "yup";

export const signInValidationSchema = {
  name: string().required("El nombre es obligatorio"),
  lastName: string().required("El apellido es obligatorio"),
  phone: string().required("El teléfono es obligatorio"),
  email: string()
    .email("El email no es válido")
    .required("El email es obligatorio"),
  password: string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("La contraseña es obligatoria")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial."
    ),
};

export const ProfileAdminValidationSchema = {
  name: string().required("El nombre es obligatorio"),
  lastName: string().required("El apellido es obligatorio"),
  phone: string().required("El teléfono es obligatorio"),
  role: string()
    .oneOf(["user", "admin", "teacher"], "Rol no válido")
    .required("El rol es obligatorio"),
};

export const DraftValidationSchema = {
  title: string().required("El título es obligatorio"),
  content: string().required("El contenido es obligatorio"),
};
