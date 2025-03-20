import { Sequelize } from "sequelize-typescript"
import { logger } from "./logger"
import dotenv from "dotenv"
import path from "path"

dotenv.config()

const { NODE_ENV = "production" } = process.env

const requiredEnvVars = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"]
const missingEnvVars = requiredEnvVars.filter(
  (envVar) => (process.env[envVar] ?? "").trim() === "",
)

if (missingEnvVars.length > 0) {
  if (NODE_ENV !== "production") {
    logger.error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`,
    )
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`,
    )
  } else {
    logger.warn(
      `Some environment variables appear to be missing: ${missingEnvVars.join(", ")}. ` +
        `Continuing in production mode assuming they will be injected by the container runtime.`,
    )
  }
}

const { DB_HOST, DB_PORT = "3306", DB_NAME, DB_USER, DB_PASSWORD } = process.env

const commonOptions = {
  dialect: "mysql" as const,
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  logging: (msg: string) => {
    logger.debug(msg)
  },
  models: [path.join(__dirname, "..", "models")],
  define: {
    timestamps: true,
    underscored: true,
  },
}

// Environment-specific configurations
let sequelize: Sequelize
if (NODE_ENV === "development") {
  logger.info("Connecting to development database")
  sequelize = new Sequelize({
    ...commonOptions,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  })
} else {
  logger.info("Connecting to AWS RDS MySQL database using standard connection")
  sequelize = new Sequelize({
    ...commonOptions,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
      connectTimeout: 30000,
    },
  })
}

export const initializeDatabase = async (): Promise<void> => {
  const maxRetries = NODE_ENV === "production" ? 5 : 1
  let retries = 0

  while (retries < maxRetries) {
    try {
      logger.info(
        `Connecting to the database (attempt ${retries + 1}/${maxRetries})...`,
      )
      await sequelize.authenticate()
      logger.info("Database connection has been established successfully.")

      // Only sync in development
      if (NODE_ENV === "development") {
        await sequelize.sync({ alter: true })
        logger.info("All models were synchronized successfully.")
      }

      return
    } catch (error) {
      retries++

      if (retries >= maxRetries) {
        logger.error(
          "Unable to connect to the database after maximum retries: ",
          error,
        )
        throw error
      }

      // Wait before retrying (exponential backoff)
      const delayMs = 1000 * Math.pow(2, retries - 1)
      logger.warn(`Connection failed. Retrying in ${delayMs}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

export { sequelize }
