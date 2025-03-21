import express, { type Application } from "express"
import helmet from "helmet"
import cors from "cors"
import compression from "compression"
import { initializeDatabase } from "./config/database"
import runMigrations from "./migrations/run-migrations"
import taskRoutes from "./routes/task.routes"
import { errorMiddleware } from "./middleware/error.middleware"
import { requestLogger } from "./middleware/logger.middleware"
import { notFoundMiddleware } from "./middleware/not-found.middleware"
import { logger } from "./config/logger"
import { serverConfig } from "./config/server"

class App {
  public app: Application

  constructor() {
    this.app = express()
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeErrorHandling()
  }

  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmet())
    this.app.use(cors())

    // Request parsing
    this.app.use(express.json({ limit: "10kb" }))
    this.app.use(express.urlencoded({ extended: true, limit: "10kb" }))

    // Performance optimizations
    this.app.use(compression())

    // Logging
    this.app.use(requestLogger)
  }

  private initializeRoutes(): void {
    this.app.get("/health", (req, res) => {
      res.status(200).json({ status: "ok" })
    })

    this.app.use("/api/tasks", taskRoutes)
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundMiddleware)
    this.app.use(errorMiddleware)
  }

  public async listen(): Promise<void> {
    try {
      await initializeDatabase()

      if (process.env.NODE_ENV === "production") {
        logger.info("Running database migrations...")
        await runMigrations()
      }

      const PORT = serverConfig.port
      this.app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`)
      })
    } catch (error) {
      logger.error("Failed to start server", { error })
      process.exit(1)
    }
  }
}

export default App
