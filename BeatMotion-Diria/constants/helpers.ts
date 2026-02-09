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
  if (!status) return "text-gray-100";
  if (["approved", "ok"].includes(status)) return "text-green-400";
  if (status === "pending") return "text-yellow-400";
  if (["rejected", "late"].includes(status)) return "text-red-400";
  return "text-gray-100";
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

const formatDate = (dateString: string | null) => {
  try {
    if (dateString === null) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CR");
  } catch (error) {
    console.error("No se pudo formatear la fecha:", error);
    return dateString;
  }
};

export const sanitizeVimeoUrl = (url: string) => {
  const match = url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/);
  return match ? match[1] : null;
};

export const sanitizeYouTubeUrl = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

export {
  capitalize,
  formatCurrency,
  formatDate,
  getEnrollmentColor,
  statusTranslations,
};
