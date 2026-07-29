export type AuthUser = {
  name: string;
  email: string;
  role: 'admin';
};

const AUTH_STORAGE_KEY = 'cospace-auth-user';

export const createSession = (user: AuthUser) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const getCurrentUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const isAuthenticated = () => getCurrentUser() !== null;

export const clearSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
