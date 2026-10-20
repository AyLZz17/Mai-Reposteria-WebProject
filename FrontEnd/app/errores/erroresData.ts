export interface HttpErrorInfo {
  codigo: string;
  titulo: string;
  descripcion: string;
  icono: string;
}

export const ERRORES_SOPORTADOS: Record<string, HttpErrorInfo> = {
  "400": {
    codigo: "400",
    titulo: "Solicitud incorrecta",
    descripcion:
      "La solicitud enviada no pudo ser procesada por el servidor debido a un formato no válido.",
    icono: "⚠️",
  },
  "401": {
    codigo: "401",
    titulo: "No autorizado",
    descripcion:
      "No cuentas con las credenciales necesarias para acceder a este recurso. Inicia sesión para continuar.",
    icono: "🔒",
  },
  "403": {
    codigo: "403",
    titulo: "Acceso prohibido",
    descripcion:
      "No tienes permisos suficientes para visualizar el contenido o realizar esta acción.",
    icono: "🚫",
  },
  "404": {
    codigo: "404",
    titulo: "Página no encontrada",
    descripcion:
      "Lo sentimos, la página que buscas no existe o ha sido movida.",
    icono: "🔍",
  },
  "500": {
    codigo: "500",
    titulo: "Error interno del servidor",
    descripcion:
      "Ocurrió un problema inesperado en nuestros servidores. Por favor, intenta de nuevo más tarde.",
    icono: "💥",
  },
  "503": {
    codigo: "503",
    titulo: "Servicio no disponible",
    descripcion:
      "El servidor está temporalmente fuera de servicio por mantenimiento o sobrecarga. Intenta nuevamente en unos minutos.",
    icono: "⏳",
  },
};

export const CODIGOS_ERROR_VALIDOS = ["400", "401", "403", "404", "500", "503"] as const;
