import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/apiResponse.js';

export const notFound: RequestHandler = (request, response) => {
  sendError(
    response,
    404,
    `Route ${request.method} ${request.originalUrl} was not found.`,
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error instanceof Error ? error.message : 'Unknown error';
  const publicMessage =
    statusCode === 500 ? 'An unexpected server error occurred.' : message;
  const errors =
    process.env.NODE_ENV !== 'production' && statusCode === 500
      ? [{ message }]
      : null;
  sendError(response, statusCode, publicMessage, errors);
};
