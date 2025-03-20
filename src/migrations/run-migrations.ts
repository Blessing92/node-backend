import dotenv from "dotenv"
import path from "path"
import { sequelize } from "../config/database"
import { MigrationManager } from "./migration-manager"
import { logger } from "../config/logger"

dotenv.config({ path: path.resolve(__dirname, "../../.env") })

const runMigrations = async (): Promise<void> => {
  try {
    const migrationManager = new MigrationManager(sequelize)

    await migrationManager.runMigrations()

    logger.info("Migrations completed successfully")
    process.exit(0)
  } catch (error) {
    logger.error("Migration process failed", { error })
    process.exit(1)
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().catch((error) => {
    console.error("Migration failed:", error)
    process.exit(1)
  })
}

export default runMigrations
