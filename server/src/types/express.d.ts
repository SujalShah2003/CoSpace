import type { User } from './domain.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
