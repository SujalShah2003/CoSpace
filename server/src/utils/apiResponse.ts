import type { Response } from 'express';
import type { PaginationMeta } from './pagination.js';

type SuccessOptions<T> = {
  statusCode?: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
};

export const sendSuccess = <T>(
  response: Response,
  { statusCode = 200, message, data, pagination }: SuccessOptions<T>,
): void => {
  response.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    ...(pagination ? { pagination } : {}),
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  response: Response,
  statusCode: number,
  message: string,
  errors: unknown = null,
): void => {
  response.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};
