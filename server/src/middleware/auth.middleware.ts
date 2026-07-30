import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { store } from '../data/store.js';
import { AppError } from '../utils/AppError.js';
import type { NextFunction, Request, Response } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import type { UserRole } from '../types/domain.js';

type AccessTokenPayload = JwtPayload & {
  sub: string;
  role: UserRole;
  type: 'access';
};

export const authenticate = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return next(new AppError(401, 'Authentication is required.'));
  }

  try {
    const payload = jwt.verify(
      token,
      env.jwtAccessSecret,
    ) as AccessTokenPayload;
    if (payload.type !== 'access') {
      throw new Error('Invalid access token type');
    }
    const user = store.users.find((item) => item.id === payload.sub);

    if (!user) {
      throw new Error('User not found');
    }

    request.user = user;
    return next();
  } catch {
    return next(new AppError(401, 'Your session is invalid or has expired.'));
  }
};

export const authorize = (...roles: UserRole[]) => (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  if (!request.user || !roles.includes(request.user.role)) {
    return next(new AppError(403, 'You do not have permission to perform this action.'));
  }
  return next();
};
