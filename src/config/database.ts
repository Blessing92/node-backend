import { Sequelize } from "sequelize-typescript";
import { logger } from "./logger"
import dotenv from "dotenv"

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const {
  DB_HOST,
  DB_PORT = "3306",
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  NODE_ENV = "development"
} = process.env

const sequelize = new Sequelize({
  dialect: "mysql",
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  logging: NODE_ENV === "development" ? (msg) => logger.debug(msg) : false,
  models: [__dirname + "/../models"],
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
})

export const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection has been established successfully.")

    // Sync all models with database
    if (NODE_ENV === "development") {
      await sequelize.sync({ alter: true});
      logger.info("All models were synchronized successfully.");
    }
  } catch (error) {
    logger.error("Unable to connect to the database: ", error)
    throw error;
  }
}

export { sequelize };
