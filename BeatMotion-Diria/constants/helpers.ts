const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const statusTranslations: { [key: string]: string } = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
};

const getEnrollmentColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-yellow-400";
    case "accepted":
      return "text-green-400";
    case "rejected":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};
export { capitalize, statusTranslations, getEnrollmentColor };
