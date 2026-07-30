import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import type { Database } from '../types/supabase.js';
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

type UserRow = Database['public']['Tables']['users']['Row'];

export const mapUser = (row: UserRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role,
  createdAt: row.created_at,
});

export const findUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new AppError(500, `Unable to read the user: ${error.message}`);
  return data ? mapUser(data) : null;
};

const createTokenPair = async (user: User): Promise<TokenPair> => {
  const now = Date.now();
  const sessionId = randomUUID();
  const accessTokenExpiresAt = new Date(
    now + env.accessTokenExpiresIn * 1000,
  ).toISOString();
  const refreshTokenExpiresAt = new Date(
    now + env.refreshTokenExpiresIn * 1000,
  ).toISOString();

  const supabase = getSupabaseAdmin();
  await supabase
    .from('refresh_sessions')
    .delete()
    .lt('expires_at', new Date(now).toISOString());
  const { error } = await supabase.from('refresh_sessions').insert({
    id: sessionId,
    user_id: user.id,
    expires_at: refreshTokenExpiresAt,
  });
  if (error) {
    throw new AppError(500, `Unable to create the login session: ${error.message}`);
  }

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

const createAuthSession = async (user: User): Promise<AuthSession> => ({
  user: publicUser(user),
  tokens: await createTokenPair(user),
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
  const supabase = getSupabaseAdmin();
  const { data: existing, error: readError } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();
  if (readError) {
    throw new AppError(500, `Unable to check the account: ${readError.message}`);
  }
  if (existing) {
    throw new AppError(409, 'An account with this email already exists.');
  }

  const { data, error } = await supabase.from('users').insert({
    name: name.trim(),
    email: normalizedEmail,
    password_hash: await bcrypt.hash(password, 10),
    role: 'member',
  }).select('*').single();
  if (error) {
    if (error.code === '23505') {
      throw new AppError(409, 'An account with this email already exists.');
    }
    throw new AppError(500, `Unable to register the member: ${error.message}`);
  }
  return createAuthSession(mapUser(data));
};

export const login = async ({
  email,
  password,
}: AuthCredentials): Promise<AuthSession> => {
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .select('*')
    .eq('email', String(email || '').trim().toLowerCase())
    .maybeSingle();
  if (error) throw new AppError(500, `Unable to sign in: ${error.message}`);
  const user = data ? mapUser(data) : null;
  if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password.');
  }
  return createAuthSession(user);
};

export const refresh = async (refreshToken: string): Promise<TokenPair> => {
  if (!refreshToken) throw new AppError(400, 'Refresh token is required.');
  const payload = verifyRefreshToken(refreshToken);
  const supabase = getSupabaseAdmin();
  const { data: session, error } = await supabase
    .from('refresh_sessions')
    .delete()
    .eq('id', payload.jti)
    .eq('user_id', payload.sub)
    .gt('expires_at', new Date().toISOString())
    .select('id')
    .maybeSingle();
  if (error) {
    throw new AppError(500, `Unable to rotate the session: ${error.message}`);
  }
  const user = await findUserById(payload.sub);

  if (!session || !user) {
    throw new AppError(401, 'The refresh token has been revoked or has expired.');
  }

  return createTokenPair(user);
};

export const logout = async (refreshToken: string): Promise<void> => {
  if (!refreshToken) return;
  try {
    const payload = jwt.verify(
      refreshToken,
      env.jwtRefreshSecret,
    ) as RefreshPayload;
    await getSupabaseAdmin()
      .from('refresh_sessions')
      .delete()
      .eq('id', payload.jti);
  } catch {
    // Logout remains idempotent even if the supplied token is already invalid.
  }
};
