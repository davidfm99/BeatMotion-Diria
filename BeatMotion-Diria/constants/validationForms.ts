import { string } from "yup";

import * as yup from "yup";

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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-])[A-Za-z\d@$!%*?&\-]{8,}$/,
      "La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial [@$!%*?&-].",
    ),
};

export const ProfileAdminValidationSchema = {
  name: string()
    .required("El nombre es obligatorio")
    .min(2, "El nombre debe de contener un mínimo de 2 letras"),
  lastName: string()
    .required("El apellido es obligatorio")
    .min(2, "El apellido debe de contener un mínimo de 2 letras"),
  phone: string()
    .required("El teléfono es obligatorio")
    .min(8, "Debe de ingresar un número válido")
    .max(8, "Debe de ingresar un número válido"),
  role: string()
    .oneOf(["user", "admin", "teacher"], "Rol no válido")
    .required("El rol es obligatorio"),
};

export const DraftValidationSchema = {
  title: string().required("El título es obligatorio"),
  content: string().required("El contenido es obligatorio"),
};

export const UserProfileValidationSchema = {
  name: string()
    .required("El nombre es obligatorio")
    .min(2, "El nombre debe de contener un mínimo de 2 letras"),
  lastName: string()
    .required("El apellido es obligatorio")
    .min(2, "El apellido debe de contener un mínimo de 2 letras"),
  phone: string()
    .required("El teléfono es obligatorio")
    .min(8, "Debe de ingresar un número válido")
    .max(8, "Debe de ingresar un número válido"),
};

export const eventSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required("El título es obligatorio.")
    .min(3, "El título debe tener al menos 3 caracteres."),
  description: yup.string().nullable(),
  datetime: yup
    .date()
    .required("La fecha del evento es obligatoria.")
    .min(new Date(), "La fecha no puede ser en el pasado."),
  capacityInput: yup.string().when(["unlimited"], (values, schema) => {
    const [unlimited] = values as [boolean];

    return unlimited
      ? schema.nullable()
      : schema
          .required("Debe indicar los cupos disponibles.")
          .matches(/^[0-9]+$/, "Debe ser un número válido.")
          .test(
            "min-1",
            "La capacidad debe ser al menos 1.",
            (v) => Number(v) > 0,
          );
  }),
  unlimited: yup.boolean(),
  priceInput: yup.string().when(["isFree"], (values, schema) => {
    const [isFree] = values as [boolean];

    return isFree
      ? schema.nullable()
      : schema
          .required("Debe indicar un precio.")
          .matches(/^[0-9]+$/, "Debe ser un número válido.")
          .test(
            "min-price",
            "El precio debe ser mayor a 0.",
            (v) => Number(v) > 0,
          );
  }),
  isFree: yup.boolean(),
  isPublic: yup.boolean(),
  status: yup
    .string()
    .oneOf(["draft", "published"], "Estado no válido.")
    .required(),
  category: yup.string().required("Debe seleccionar una categoría."),

  location: yup
    .string()
    .trim()
    .required("La ubicación es obligatoria.")
    .min(3, "La ubicación es demasiado corta."),

  bannerUrl: yup.string().url("La imagen debe ser una URL válida.").nullable(),
});
