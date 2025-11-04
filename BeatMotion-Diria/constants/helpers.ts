const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const statusTranslations: { [key: string]: string } = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  ok: "Pago realizado",
  late: "Pago atrasado",
};

const getEnrollmentColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-yellow-400";
    case "approved":
    case "ok":
      return "text-green-400";
    case "rejected":
    case "late":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

const formatCurrency = (value: number, currency?: string) => {
  const fallback = `${currency ?? "CRC"} ${value.toLocaleString("es-CR")}`;
  try {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: currency ?? "CRC",
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    console.error("No se pudo formatear el monto:", error);
    return fallback;
  }
};

export { capitalize, formatCurrency, getEnrollmentColor, statusTranslations };
