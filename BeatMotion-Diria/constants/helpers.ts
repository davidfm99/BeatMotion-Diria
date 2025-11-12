const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const statusTranslations: { [key: string]: string } = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  ok: "Realizado",
  late: "Atrasado",
};

const getEnrollmentColor = (status: string) => {
  if (status === "pending") return "text-yellow-400";
  if (status === "approved" || status === "ok") return "text-green-400";
  return "text-red-400";
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

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CR");
  } catch (error) {
    console.error("No se pudo formatear la fecha:", error);
    return dateString;
  }
};

export {
  capitalize,
  formatCurrency,
  formatDate,
  getEnrollmentColor,
  statusTranslations,
};
