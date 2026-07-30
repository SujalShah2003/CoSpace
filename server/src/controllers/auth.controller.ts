import * as authService from '../services/auth.service.js';
import type { Request, Response } from 'express';
import type {
  AuthCredentials,
  RegistrationInput,
} from '../types/domain.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

type RefreshBody = { refreshToken: string };

export const register = async (
  request: Request<unknown, unknown, RegistrationInput>,
  response: Response,
): Promise<void> => {
  const result = await authService.registerMember(request.body);
  sendSuccess(response, {
    statusCode: 201,
    message: 'Member registered successfully.',
    data: result,
  });
};

export const login = async (
  request: Request<unknown, unknown, AuthCredentials>,
  response: Response,
): Promise<void> => {
  const result = await authService.login(request.body);
  sendSuccess(response, {
    message: 'Login successful.',
    data: result,
  });
};

export const me = (request: Request, response: Response): void => {
  if (!request.user) {
    sendError(response, 401, 'Authentication is required.');
    return;
  }
  const { passwordHash: _passwordHash, ...user } = request.user;
  sendSuccess(response, {
    message: 'Profile retrieved successfully.',
    data: user,
  });
};

export const refresh = async (
  request: Request<unknown, unknown, RefreshBody>,
  response: Response,
): Promise<void> => {
  const tokens = await authService.refresh(request.body.refreshToken);
  sendSuccess(response, {
    message: 'Tokens refreshed successfully.',
    data: { tokens },
  });
};

export const logout = async (
  request: Request<unknown, unknown, RefreshBody>,
  response: Response,
): Promise<void> => {
  await authService.logout(request.body.refreshToken);
  sendSuccess(response, {
    message: 'Logout successful.',
    data: null,
  });
};
