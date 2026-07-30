import type { RequestHandler } from 'express';

type AsyncController = (...arguments_: any[]) => unknown;

export const asyncHandler = (handler: AsyncController): RequestHandler => (
  request,
  response,
  next,
) => Promise.resolve(handler(request, response, next)).catch(next);
