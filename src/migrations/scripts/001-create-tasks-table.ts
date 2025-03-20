import { QueryInterface, DataTypes } from "sequelize"
import { TaskStatus } from "../../enums/task-status.enum"

export async function up(queryInterface: QueryInterface): Promise<void> {
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

  // Add indexes
  await queryInterface.addIndex("tasks", ["title"])
  await queryInterface.addIndex("tasks", ["due_date"])
  await queryInterface.addIndex("tasks", ["status"])
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable("tasks")
}
