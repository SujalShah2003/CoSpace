import './load-env.js';

type Environment = {
  port: number;
  clientOrigins: string[];
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
};

export const env: Environment = {
  port: Number(process.env.PORT || 4000),
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ||
    'cospace-access-development-secret-change-in-production',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    'cospace-refresh-development-secret-change-in-production',
  accessTokenExpiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN || 900),
  refreshTokenExpiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN || 604800),
};
