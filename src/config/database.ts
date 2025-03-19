import { Sequelize } from "sequelize-typescript"
import { logger } from "./logger"
import dotenv from "dotenv"
import path from "path"
import { RDSDataService } from "aws-sdk"

dotenv.config()

const { NODE_ENV = "development" } = process.env

let sequelize: Sequelize

// Local development with regular MySQL connection
if (NODE_ENV === "development" && process.env.DB_HOST) {
  const requiredEnvVars = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"]
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => (process.env[envVar] ?? "").trim() === "",
  )

  if (missingEnvVars.length > 0) {
    logger.error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`,
    )
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`,
    )
  }

  const {
    DB_HOST,
    DB_PORT = "3306",
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
  } = process.env

  sequelize = new Sequelize({
    dialect: "mysql",
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    logging: (msg) => {
      logger.debug(msg)
    },
    models: [path.join(__dirname, "..", "models")],
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  })
}
// Production/staging with RDS Data API
else {
  const requiredEnvVars = ["DB_ARN", "SECRET_ARN_PROD", "DB_NAME"]
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => (process.env[envVar] ?? "").trim() === "",
  )

  if (missingEnvVars.length > 0) {
    logger.error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`,
    )
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`,
    )
  }

  const {
    DB_ARN,
    SECRET_ARN,
    DB_NAME,
    AWS_REGION = "eu-central-1",
  } = process.env

  const dataAPI = new RDSDataService({
    region: AWS_REGION,
  })

  sequelize = new Sequelize({
    dialect: "mysql",
    database: DB_NAME,
    logging: (msg) => {
      logger.debug(msg)
    },
    models: [path.join(__dirname, "..", "models")],
    dialectOptions: {
      dataAPI,
      resourceArn: DB_ARN,
      secretArn: SECRET_ARN,
      database: DB_NAME,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  })
}

export const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate()
    logger.info("Database connection has been established successfully.")

    // Only sync in development
    if (NODE_ENV === "development") {
      await sequelize.sync({ alter: true })
      logger.info("All models were synchronized successfully.")
    }
  } catch (error) {
    logger.error("Unable to connect to the database: ", error)
    throw error
  }
}

export { sequelize }
