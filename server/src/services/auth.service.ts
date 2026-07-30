import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { store } from '../data/store.js';
import { AppError } from '../utils/AppError.js';
import type {
  AuthCredentials,
  AuthSession,
  PublicUser,
  RegistrationInput,
  TokenPair,
  User,
  UserRole,
} from '../types/domain.js';

type RefreshPayload = JwtPayload & {
  sub: string;
  jti: string;
  role: UserRole;
  type: 'refresh';
};

const publicUser = ({ passwordHash: _passwordHash, ...user }: User): PublicUser =>
  user;

const createTokenPair = (user: User): TokenPair => {
  const now = Date.now();
  const sessionId = randomUUID();
  const accessTokenExpiresAt = new Date(
    now + env.accessTokenExpiresIn * 1000,
  ).toISOString();
  const refreshTokenExpiresAt = new Date(
    now + env.refreshTokenExpiresIn * 1000,
  ).toISOString();

  store.refreshSessions = store.refreshSessions.filter(
    (session) => session.expiresAt > now,
  );
  store.refreshSessions.push({
    id: sessionId,
    userId: user.id,
    expiresAt: new Date(refreshTokenExpiresAt).getTime(),
  });

  return {
    accessToken: jwt.sign(
      { sub: user.id, role: user.role, type: 'access' },
      env.jwtAccessSecret,
      { expiresIn: env.accessTokenExpiresIn, jwtid: randomUUID() },
    ),
    refreshToken: jwt.sign(
      { sub: user.id, role: user.role, type: 'refresh' },
      env.jwtRefreshSecret,
      { expiresIn: env.refreshTokenExpiresIn, jwtid: sessionId },
    ),
    tokenType: 'Bearer',
    accessTokenExpiresIn: env.accessTokenExpiresIn,
    refreshTokenExpiresIn: env.refreshTokenExpiresIn,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  };
};

const createAuthSession = (user: User): AuthSession => ({
  user: publicUser(user),
  tokens: createTokenPair(user),
});

const verifyRefreshToken = (refreshToken: string): RefreshPayload => {
  try {
    const payload = jwt.verify(
      refreshToken,
      env.jwtRefreshSecret,
    ) as RefreshPayload;
    if (
      payload.type !== 'refresh' ||
      !payload.sub ||
      !payload.jti
    ) {
      throw new Error('Invalid refresh token payload');
    }
    return payload;
  } catch {
    throw new AppError(401, 'The refresh token is invalid or has expired.');
  }
};

export const registerMember = async ({
  name,
  email,
  password,
}: RegistrationInput): Promise<AuthSession> => {
  if (!name?.trim() || !email?.trim() || !password) {
    throw new AppError(400, 'Name, email and password are required.');
  }
  if (password.length < 6) {
    throw new AppError(400, 'Password must contain at least 6 characters.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (store.users.some((user) => user.email === normalizedEmail)) {
    throw new AppError(409, 'An account with this email already exists.');
  }

  const user: User = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'member',
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  return createAuthSession(user);
};

export const login = async ({
  email,
  password,
}: AuthCredentials): Promise<AuthSession> => {
  const user = store.users.find(
    (item) => item.email === String(email || '').trim().toLowerCase(),
  );
  if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password.');
  }
  return createAuthSession(user);
};

export const refresh = (refreshToken: string): TokenPair => {
  if (!refreshToken) throw new AppError(400, 'Refresh token is required.');
  const payload = verifyRefreshToken(refreshToken);
  const session = store.refreshSessions.find(
    (item) =>
      item.id === payload.jti &&
      item.userId === payload.sub &&
      item.expiresAt > Date.now(),
  );
  const user = store.users.find((item) => item.id === payload.sub);

  if (!session || !user) {
    throw new AppError(401, 'The refresh token has been revoked or has expired.');
  }

  // Rotate refresh tokens: each refresh token can be used only once.
  store.refreshSessions = store.refreshSessions.filter(
    (item) => item.id !== session.id,
  );
  return createTokenPair(user);
};

export const logout = (refreshToken: string): void => {
  if (!refreshToken) return;
  try {
    const payload = jwt.verify(
      refreshToken,
      env.jwtRefreshSecret,
    ) as RefreshPayload;
    store.refreshSessions = store.refreshSessions.filter(
      (item) => item.id !== payload.jti,
    );
  } catch {
    // Logout remains idempotent even if the supplied token is already invalid.
  }
};
