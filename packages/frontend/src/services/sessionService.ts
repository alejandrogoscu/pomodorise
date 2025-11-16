import api from "./api";
import { ISession, CreateSessionDTO } from "@pomodorise/shared";

export const createSession = async (
  data: CreateSessionDTO
): Promise<ISession> => {
  const response = await api.post<{ data: ISession }>("/api/sessions", data);
  return response.data.data;
};

export const completeSession = async (
  sessionId: string
): Promise<{
  session: ISession;
  pointsEarned: number;
  user: { level: number; points: number; streak: number };
}> => {
  const response = await api.patch<{
    data: {
      session: ISession;
      pointsEarned: number;
      user: { level: number; points: number; streak: number };
    };
  }>(`/api/sessions/${sessionId}/complete`);
  return response.data.data;
};

export const getSessions = async (filters?: {
  completed?: boolean;
  limit?: number;
}): Promise<ISession[]> => {
  const params = new URLSearchParams();

  if (filters?.completed !== undefined) {
    params.append("completed", String(filters.completed));
  }

  if (filters?.limit) {
    params.append("limit", String(filters.limit));
  }

  const response = await api.get<{ data: ISession[] }>(
    `/api/sessions?${params.toString()}`
  );
  return response.data.data;
};
