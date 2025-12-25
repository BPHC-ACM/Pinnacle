export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 3000,

  //oauth
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3000/auth/google/callback',

  //jwt
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',

  //frontend
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
};
