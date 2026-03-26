import { apiClient } from "~/api/client";

export type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken?: string;
  token?: string;
};

export const authService = {
  async login(email: string, password: string): Promise<string> {
    const response = await apiClient.post<LoginResponse, LoginPayload>(
      "/auth/login",
      { email, password },
    );

    const token = response.accessToken ?? response.token;

    if (!token) {
      throw new Error("Token not found in login response");
    }

    return token;
  },
};
