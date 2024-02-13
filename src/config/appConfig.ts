import * as dotenv from 'dotenv'
export const APP_CONSTANTS = {
  ENV: 'NODE_ENV',
  DEV: 'dev',
  QA: 'qa',
  LOCAL: 'local',
  redisUrl: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
}

export let appConfig = {
  env: {
    SOCKET_PORT: process.env.SOCKET_PORT,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DOMAIN_NAME: process.env.DOMAIN_NAME,
    DB_URL: process.env.DB_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_DB: process.env.REDIS_DB,
    DB_NAME: process.env.DEV_DB_NAME,
    SALT: process.env.DEV_SALT,
    SECRET_KEY: process.env.DEV_SECRET_KEY,
    SECRET_KEY_OTP: process.env.DEV_SECRET_KEY_OTP,
    EMAIL: process.env.DEV_EMAIL,
    PASSWORD: process.env.DEV_PASSWORD,
    ADMIN_PASSWORD: process.env.DEV_ADMIN_PASSWORD,
    ORIGIN: process.env.DEV_ORIGIN,
    CONTENT_TYPE: process.env.DEV_CONTENT_TYPE,
    API_URL: process.env.DEV_API_URL,
    LOGIN_URL: process.env.DEV_LOGIN_URL,
    DEV_EMAIL: process.env.DEV_EAMIL,
    DEV_PASSWORD: process.env.DEV_PASSWORD_TOKEN,
    STORAGE_BUCKET: process.env.DEV_STORAGE_BUCKET,
    PROJECT_ID: process.env.DEV_PROJECT_ID,
    FILE_NAME: process.env.DEV_FILENAME,
    FIREBASE_FILE_NAME: process.env.DEV_FILENAME,
    FILE_CONTENT: process.env.DEV_FILE_CONTENT,
    FIREBASE_FILE_CONTENT: process.env.DEV_FIREBASE_FILE_CONTENT,
    CLIENT_EMAIL: process.env.DEV_CLIENT_EMAIL,
    CLIENT_PASSWORD: process.env.DEV_CLIENT_PASSWORD,
    USER_LIST_API: process.env.DEV_USER_LIST_API_URL,
    API_KEY: process.env.DEV_API_KEY,
    DEV_HOST: process.env.DEV_HOST,
    DEV_PORT: process.env.DEV_PORT,
    KAFKA_BROKER_1:process.env.KAFKA_BROKER_1 || "BROKER_1",
    KAFKA_TOPIC_PRODUCER:process.env.KAFKA_TOPIC_PRODUCER
  },
}
switch (process.env.NODE_ENV) {
  case 'dev':
    // dotenv.config({ path: '' });
    appConfig = {
      env: {
        NODE_ENV: process.env.NODE_ENV,
        SOCKET_PORT: process.env.SOCKET_PORT,
        PORT: process.env.DEV_APPLICATION_PORT || '5001',
        DOMAIN_NAME: process.env.DEV_DOMAIN_NAME,
        DB_URL: process.env.DEV_DB_URL,
        REDIS_HOST: process.env.DEV_REDIS_HOST,
        REDIS_PORT: process.env.DEV_REDIS_PORT,
        REDIS_DB: process.env.DEV_REDIS_DB,
        DB_NAME: process.env.DEV_DB_NAME,
        SALT: process.env.DEV_SALT,
        SECRET_KEY: process.env.DEV_SECRET_KEY,
        SECRET_KEY_OTP: process.env.DEV_SECRET_KEY_OTP,
        EMAIL: process.env.DEV_EMAIL,
        PASSWORD: process.env.DEV_PASSWORD,
        ADMIN_PASSWORD: process.env.DEV_ADMIN_PASSWORD,
        ORIGIN: process.env.DEV_ORIGIN,
        CONTENT_TYPE: process.env.DEV_CONTENT_TYPE,
        API_URL: process.env.DEV_API_URL,
        LOGIN_URL: process.env.DEV_LOGIN_URL,
        DEV_EMAIL: process.env.DEV_EAMIL,
        DEV_PASSWORD: process.env.DEV_PASSWORD_TOKEN,
        STORAGE_BUCKET: process.env.DEV_STORAGE_BUCKET,
        PROJECT_ID: process.env.DEV_PROJECT_ID,
        FILE_NAME: process.env.DEV_FILENAME,
        FIREBASE_FILE_NAME: process.env.DEV_FILENAME,
        FILE_CONTENT: process.env.DEV_FILE_CONTENT,
        FIREBASE_FILE_CONTENT: process.env.DEV_FIREBASE_FILE_CONTENT,
        CLIENT_EMAIL: process.env.DEV_CLIENT_EMAIL,
        CLIENT_PASSWORD: process.env.DEV_CLIENT_PASSWORD,
        USER_LIST_API: process.env.DEV_USER_LIST_API_URL,
        API_KEY: process.env.DEV_API_KEY,
        DEV_HOST: process.env.DEV_HOST,
        DEV_PORT: process.env.DEV_PORT,
        KAFKA_BROKER_1:process.env.KAFKA_BROKER_1 || "BROKER_1",
        KAFKA_TOPIC_PRODUCER:process.env.KAFKA_TOPIC_PRODUCER
      },
    }
    console.log('appconfig ===================> ', appConfig)
    break
  case 'stag':
    dotenv.config({ path: '.env.stag' })
    appConfig = {
      env: {
        SOCKET_PORT: process.env.SOCKET_PORT,
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.STG_APPLICATION_PORT || '5001',
        DOMAIN_NAME: process.env.STG_DOMAIN_NAME,
        DB_URL: process.env.STG_DB_URL,
        REDIS_HOST: process.env.STG_REDIS_HOST,
        REDIS_PORT: process.env.STG_REDIS_PORT,
        REDIS_DB: process.env.STG_REDIS_DB,
        DB_NAME: process.env.STG_DB_NAME,
        SALT: process.env.STG_SALT,
        SECRET_KEY: process.env.STG_SECRET_KEY,
        SECRET_KEY_OTP: process.env.STG_SECRET_KEY_OTP,
        EMAIL: process.env.STG_EMAIL,
        PASSWORD: process.env.STG_PASSWORD,
        ADMIN_PASSWORD: process.env.STG_ADMIN_PASSWORD,
        ORIGIN: process.env.STG_ORIGIN,
        CONTENT_TYPE: process.env.STG_CONTENT_TYPE,
        API_URL: process.env.STG_API_URL,
        LOGIN_URL: process.env.STG_LOGIN_URL,
        DEV_EMAIL: process.env.STG_EAMIL,
        DEV_PASSWORD: process.env.STG_PASSWORD_TOKEN,
        STORAGE_BUCKET: process.env.STG_STORAGE_BUCKET,
        PROJECT_ID: process.env.STG_PROJECT_ID,
        FILE_NAME: process.env.STG_FILENAME,
        FIREBASE_FILE_NAME: process.env.STG_FIREBASE_FILENAME,
        FILE_CONTENT: process.env.STG_FILE_CONTENT,
        FIREBASE_FILE_CONTENT: process.env.STG_FIREBASE_FILE_CONTENT,
        CLIENT_EMAIL: process.env.STG_CLIENT_EMAIL,
        CLIENT_PASSWORD: process.env.STG_CLIENT_PASSWORD,
        USER_LIST_API: process.env.STG_USER_LIST_API_URL,
        API_KEY: process.env.STG_API_KEY,
        DEV_HOST: process.env.STG_HOST,
        DEV_PORT: process.env.STG_PORT,
        KAFKA_BROKER_1:process.env.KAFKA_BROKER_1 || "BROKER_1",
        KAFKA_TOPIC_PRODUCER:process.env.KAFKA_TOPIC_PRODUCER
      },
    }
    break
  case 'local':
    dotenv.config({ path: '.env.local' })
    appConfig = {
      env: {
        SOCKET_PORT: process.env.SOCKET_PORT,
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.DEV_APPLICATION_PORT,
        DOMAIN_NAME: process.env.DEV_DOMAIN_NAME,
        DB_URL: process.env.DEV_DB_URL,
        REDIS_HOST: process.env.DEV_REDIS_HOST,
        REDIS_PORT: process.env.DEV_REDIS_PORT,
        REDIS_DB: process.env.DEV_REDIS_DB,
        DB_NAME: process.env.DEV_DB_NAME,
        SALT: process.env.DEV_SALT,
        SECRET_KEY: process.env.DEV_SECRET_KEY,
        SECRET_KEY_OTP: process.env.DEV_SECRET_KEY_OTP,
        EMAIL: process.env.DEV_EMAIL,
        PASSWORD: process.env.DEV_PASSWORD,
        ADMIN_PASSWORD: process.env.DEV_ADMIN_PASSWORD,
        ORIGIN: process.env.DEV_ORIGIN,
        CONTENT_TYPE: process.env.DEV_CONTENT_TYPE,
        API_URL: process.env.DEV_API_URL,
        LOGIN_URL: process.env.DEV_LOGIN_URL,
        DEV_EMAIL: process.env.DEV_EAMIL,
        DEV_PASSWORD: process.env.DEV_PASSWORD_TOKEN,
        STORAGE_BUCKET: process.env.DEV_STORAGE_BUCKET,
        PROJECT_ID: process.env.DEV_PROJECT_ID,
        FILE_NAME: process.env.DEV_FILENAME,
        FIREBASE_FILE_NAME: process.env.DEV_FIREBASE_FILENAME,
        FILE_CONTENT: process.env.DEV_FILE_CONTENT,
        FIREBASE_FILE_CONTENT: process.env.DEV_FIREBASE_FILE_CONTENT,
        CLIENT_EMAIL: process.env.DEV_CLIENT_EMAIL,
        CLIENT_PASSWORD: process.env.DEV_CLIENT_PASSWORD,
        USER_LIST_API: process.env.DEV_USER_LIST_API_URL,
        API_KEY: process.env.DEV_API_KEY,
        DEV_HOST: process.env.DEV_HOST,
        DEV_PORT: process.env.DEV_PORT,
        KAFKA_BROKER_1:process.env.KAFKA_BROKER_1 || "BROKER_1",
        KAFKA_TOPIC_PRODUCER:process.env.KAFKA_TOPIC_PRODUCER
      },
    }
    break
  case 'qa':
    dotenv.config({ path: '.env.qa' })
    break
  default:
    dotenv.config({ path: '.env.dev' })
    break
}

export const SYS_ERR = {
  NODE_ENV_INVALID: 100,
  BOOTSTRAP_ERROR: 101,
  MONGO_CONN_FAILED: 103,
  REDIS_CONN_FAILED: 104,
}

export default appConfig
