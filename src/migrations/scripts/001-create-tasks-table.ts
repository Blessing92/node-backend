import { QueryInterface, DataTypes } from "sequelize"
import { TaskStatus } from "../../enums/task-status.enum"
import { logger } from "../../config/logger"

export async function up(queryInterface: QueryInterface): Promise<void> {
  try {
    await queryInterface.createTable("tasks", {
      task_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(TaskStatus)),
        allowNull: false,
        defaultValue: TaskStatus.PENDING,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    })
  } catch (error: unknown) {
    // Check if error is about table already existing
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      (error.name === "SequelizeUniqueConstraintError" ||
        error.name === "SequelizeDatabaseError") &&
      "original" in error &&
      error.original &&
      typeof error.original === "object" &&
      "code" in error.original &&
      (error.original.code === "ER_TABLE_EXISTS_ERROR" ||
        error.original.code === "42P07")
    ) {
      logger.info("Table 'tasks' already exists, skipping creation...")
    } else {
      throw error
    }
  }

  // Helper function to add an index with error handling
  const addIndexSafely = async (
    columns: string[],
    indexName: string,
  ): Promise<void> => {
    try {
      await queryInterface.addIndex("tasks", columns, { name: indexName })
    } catch (error: unknown) {
      // Type guard for error object with name and original properties
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "SequelizeDatabaseError" &&
        "original" in error &&
        error.original &&
        typeof error.original === "object" &&
        "code" in error.original &&
        error.original.code === "ER_DUP_KEYNAME"
      ) {
        logger.info(`Index ${indexName} already exists, skipping...`)
      } else {
        throw error
      }
    }
  }

  // Add indexes with error handling for duplicates
  await addIndexSafely(["title"], "tasks_title")
  await addIndexSafely(["due_date"], "tasks_due_date")
  await addIndexSafely(["status"], "tasks_status")
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable("tasks")
}
