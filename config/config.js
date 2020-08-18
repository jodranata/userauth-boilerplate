require('dotenv').config({ path: './config/.env' });

module.exports = {
  PORT: process.env.SERVER_PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URL: process.env.MONGODB_URL,
  CLIENT_URL: process.env.CLIENT_URL,
  JWT_SIGN_SECRET: process.env.JWT_SIGN_SECRET,
  JWT_FORGOT_SECRET: process.env.JWT_FORGOT_SECRET,
  JWT_ACTIVATION_SECRET: process.env.JWT_ACTIVATION_SECRET,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  GOOGLE_APP: process.env.GOOGLE_APP,
};
