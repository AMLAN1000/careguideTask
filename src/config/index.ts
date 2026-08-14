import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 12,
  jwt: {
    jwt_secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
    expires_in: process.env.EXPIRES_IN || '60d',
  },
};
