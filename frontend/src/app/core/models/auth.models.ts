export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface AuthUser {
  id: string;
  nombre: string;
  correo: string;
  rol: string | null;
}

export interface AuthResponse {
  access_token: string;
  usuario: AuthUser;
}
