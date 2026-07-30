import axios, {
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  updateSessionTokens,
  type TokenPair,
} from '@/utils/auth';

export type ApiResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  timestamp: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedResult<T> = {
  records: T[];
  pagination: PaginationMeta;
};

export type ApiErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  errors: unknown;
  timestamp: string;
};

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const apiBaseUrl =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<TokenPair> | null = null;

const refreshTokens = async (): Promise<TokenPair> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token is available.');

  const { data } = await axios.post<ApiResponse<{ tokens: TokenPair }>>(
    `${apiBaseUrl}/auth/refresh`,
    { refreshToken },
    { timeout: 10000 },
  );
  updateSessionTokens(data.data.tokens);
  return data.data.tokens;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as RetryableRequest | undefined;
    const isAuthEntryRequest = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout',
    ].some((path) => request?.url?.includes(path));

    if (
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      !isAuthEntryRequest &&
      getRefreshToken()
    ) {
      request._retry = true;
      try {
        refreshPromise ??= refreshTokens().finally(() => {
          refreshPromise = null;
        });
        const tokens = await refreshPromise;
        request.headers.Authorization = `${tokens.tokenType} ${tokens.accessToken}`;
        return apiClient(request);
      } catch {
        clearSession();
      }
    } else if (error.response?.status === 401 && !isAuthEntryRequest) {
      clearSession();
    }

    return Promise.reject(error);
  },
);

export const getApiError = (error: unknown, fallback: string) =>
  axios.isAxiosError<ApiErrorResponse>(error)
    ? error.response?.data?.message || error.message
    : error instanceof Error
      ? error.message
      : fallback;
