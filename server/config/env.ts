import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const defaultJwtSecret = 'lifeos_jwt_secret_key_2026_super_secure_hash_v1';

if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET === defaultJwtSecret)) {
  console.warn('⚠️ [SECURITY WARNING] Default JWT_SECRET is being used in production mode! Set JWT_SECRET in environment variables.');
}

export const config = {
  port: process.env.PORT || 5001,
  mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://peralacharanteja001:ERmSNpzZgOq1S7l8@professionalportfolio0.abfxay0.mongodb.net/lifeos_goals_db?retryWrites=true&w=majority&appName=professionalportfolio001',
  jwtSecret: process.env.JWT_SECRET || defaultJwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3',
};

