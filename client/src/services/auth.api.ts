import { apiClient, type ApiResponse } from './apiClient';
import type { AuthSession, AuthUser, TokenPair } from '@/utils/auth';

export const registerMember = async (values: {
  name: string;
  email: string;
  password: string;
}) => {
  const { data } = await apiClient.post<ApiResponse<AuthSession>>(
    '/auth/register',
    values,
  );
  return data.data;
};

export const login = async (values: { email: string; password: string }) => {
  const { data } = await apiClient.post<ApiResponse<AuthSession>>(
    '/auth/login',
    values,
  );
  return data.data;
};

export const getProfile = async () => {
  const { data } = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
  return data.data;
};

export const refreshSession = async (refreshToken: string) => {
  const { data } = await apiClient.post<ApiResponse<{ tokens: TokenPair }>>(
    '/auth/refresh',
    { refreshToken },
  );
  return data.data.tokens;
};

export const logout = async (refreshToken: string) => {
  await apiClient.post('/auth/logout', { refreshToken });
};
