import { Sequelize, QueryInterface } from "sequelize"
import { logger } from "../config/logger"
import fs from "fs"
import path from "path"

interface MigrationMeta {
  name: string
  run_at: Date
}

export class MigrationManager {
  private readonly sequelize: Sequelize
  private readonly queryInterface: QueryInterface

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize
    this.queryInterface = sequelize.getQueryInterface()
  }

  // Initialize migrations table if it doesn't exist
  private async initMigrationsTable(): Promise<void> {
    logger.info("Checking migrations table...")

    const tables = await this.queryInterface.showAllTables()
    if (!tables.includes("migrations")) {
      logger.info("Creating migrations table...")
      await this.queryInterface.createTable("migrations", {
        id: {
          type: "INTEGER",
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: "STRING",
          allowNull: false,
          unique: true,
        },
        run_at: {
          type: "DATE",
          allowNull: false,
          defaultValue: this.sequelize.literal("CURRENT_TIMESTAMP"),
        },
      })
      logger.info("Migrations table created successfully")
    }
  }

  // Get list of completed migrations
  private async getCompletedMigrations(): Promise<string[]> {
    await this.initMigrationsTable()

    const migrations = (await this.sequelize.query(
      "SELECT name FROM migrations ORDER BY run_at ASC",
      { type: "SELECT" },
    )) as MigrationMeta[]

    return migrations.map((m) => m.name)
  }

  // Record a migration as completed
  private async recordMigration(name: string): Promise<void> {
    await this.sequelize.query("INSERT INTO migrations (name) VALUES (?)", {
      replacements: [name],
      type: "INSERT",
    })
    logger.info(`Recorded migration: ${name}`)
  }

  // Run all pending migrations
  public async runMigrations(): Promise<void> {
    logger.info("Starting migration process...")

    const completedMigrations = await this.getCompletedMigrations()

    const migrationDir = path.join(__dirname, "scripts")
    let migrationFiles = fs
      .readdirSync(migrationDir)
      .filter((file) => file.endsWith(".js") || file.endsWith(".ts"))
      .sort()

    const pendingMigrations = migrationFiles.filter(
      (file) => !completedMigrations.includes(file),
    )

    if (pendingMigrations.length === 0) {
      logger.info("No pending migrations to run")
      return
    }

    logger.info(`Found ${pendingMigrations.length} pending migrations`)

    // Run each pending migration in a transaction
    for (const migrationFile of pendingMigrations) {
      const transaction = await this.sequelize.transaction()
      try {
        logger.info(`Running migration: ${migrationFile}`)

        const migration = require(path.join(migrationDir, migrationFile))
        await migration.up(this.queryInterface, this.sequelize)

        await this.recordMigration(migrationFile)

        await transaction.commit()
        logger.info(`Successfully completed migration: ${migrationFile}`)
      } catch (error) {
        await transaction.rollback()
        logger.error(`Migration ${migrationFile} failed`, { error })
        throw error
      }
    }

    logger.info("All migrations completed successfully")
  }
}
