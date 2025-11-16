import api from "./api";
import { UserStats } from "@pomodorise/shared";

export const getUserStats = async (): Promise<UserStats> => {
  const response = await api.get<{ data: UserStats }>("/api/stats");
  return response.data.data;
};
