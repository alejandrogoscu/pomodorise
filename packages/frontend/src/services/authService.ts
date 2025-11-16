import api from "./api";
import { RegisterDTO, LoginDTO, AuthResponse, IUser } from "@pomodorise/shared";

export const register = async (data: RegisterDTO): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse & { message?: string }>(
    "/api/auth/register",
    data
  );
  return {
    token: response.data.token,
    user: response.data.user,
  };
};

export const login = async (data: LoginDTO): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse & { message?: string }>(
    "/api/auth/login",
    data
  );
  return {
    token: response.data.token,
    user: response.data.user,
  };
};

export const getCurrentUser = async (): Promise<IUser> => {
  const response = await api.get<{ user: IUser }>("/api/auth/me");
  return response.data.user;
};

export const logout = (): void => {
  localStorage.removeItem("token");
};
