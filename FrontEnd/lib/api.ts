export interface User {
  id: string;
  email: string;
  name: string;
  acceptedTerms?: boolean;
}

export interface AuthResponse {
  status: number;
  user?: User;
  message?: string;
}

export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const STORAGE_KEY_REGISTERED_USERS = "mai_registered_users_mock";

interface StoredMockUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

function getStoredMockUsers(): StoredMockUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredMockUser(newUser: StoredMockUser) {
  if (typeof window === "undefined") return;
  try {
    const users = getStoredMockUsers();
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(users));
  } catch {
    // Ignorar error al escribir
  }
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const cleanEmail = email.trim().toLowerCase();

  if (USE_MOCK) {
    // Simulación de latencia de red
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock según RF-04 y prompt:
    // error500@mai.com -> 500
    if (cleanEmail === "error500@mai.com") {
      return {
        status: 500,
        message: "Error interno del servidor",
      };
    }

    // error503@mai.com -> 503
    if (cleanEmail === "error503@mai.com") {
      return {
        status: 503,
        message: "Servicio no disponible",
      };
    }

    // cliente@mai.com / 1234 -> 200
    if (cleanEmail === "cliente@mai.com" && password === "1234") {
      return {
        status: 200,
        user: {
          id: "usr_cliente_01",
          email: "cliente@mai.com",
          name: "Cliente Mai",
        },
      };
    }

    // Verificar si es un usuario recién registrado dinámicamente
    const registeredUsers = getStoredMockUsers();
    const foundUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (foundUser) {
      return {
        status: 200,
        user: {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
        },
      };
    }

    // Cualquier otra combinación -> 401
    return {
      status: 401,
      message: "Credenciales inválidas",
    };
  }

  // API real
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const data = await res.json().catch(() => ({}));
    return {
      status: res.status,
      user: data.user,
      message: data.message,
    };
  } catch {
    return {
      status: 503,
      message: "Sin conexión con el servidor",
    };
  }
}

export async function registerApi(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Simular error de servidor si se usa error500
    if (cleanEmail === "error500@mai.com") {
      return {
        status: 500,
        message: "Error interno del servidor",
      };
    }

    // Simular error de servidor no disponible si se usa error503
    if (cleanEmail === "error503@mai.com") {
      return {
        status: 503,
        message: "Servicio no disponible",
      };
    }

    // Validación de campos requeridos
    if (!cleanName || !cleanEmail || !password) {
      return {
        status: 400,
        message: "Todos los campos son obligatorios",
      };
    }

    if (password.length < 4) {
      return {
        status: 400,
        message: "La contraseña debe tener al menos 4 caracteres",
      };
    }

    // Verificar si el usuario ya existe
    if (cleanEmail === "cliente@mai.com") {
      return {
        status: 400,
        message: "El correo electrónico ya se encuentra registrado",
      };
    }

    const registeredUsers = getStoredMockUsers();
    if (registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        status: 400,
        message: "El correo electrónico ya se encuentra registrado",
      };
    }

    // Registrar nuevo usuario
    const newUser: StoredMockUser = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password,
    };

    saveStoredMockUser(newUser);

    return {
      status: 201,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    };
  }

  // API real
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
    });

    const data = await res.json().catch(() => ({}));
    return {
      status: res.status,
      user: data.user,
      message: data.message,
    };
  } catch {
    return {
      status: 503,
      message: "Sin conexión con el servidor",
    };
  }
}
