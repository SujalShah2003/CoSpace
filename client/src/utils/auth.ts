export type UserRole = 'member' | 'admin';
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
};
export type AuthSession = { user: AuthUser; tokens: TokenPair };

const AUTH_STORAGE_KEY = 'cospace-auth-session';

export const createSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const getSession = (): AuthSession | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const getCurrentUser = () => getSession()?.user ?? null;
export const getAccessToken = () => getSession()?.tokens?.accessToken ?? null;
export const getRefreshToken = () => getSession()?.tokens?.refreshToken ?? null;
export const updateSessionTokens = (tokens: TokenPair) => {
  const session = getSession();
  if (session) createSession({ ...session, tokens });
};
export const isAuthenticated = () => Boolean(getAccessToken());
export const clearSession = () => localStorage.removeItem(AUTH_STORAGE_KEY);
