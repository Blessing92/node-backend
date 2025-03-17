import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  Default,
  PrimaryKey,
  AutoIncrement,
  Index
} from "sequelize-typescript";
import { TaskStatus } from "@/enums/task-status.enum";

@Table({
  tableName: "tasks",
  timestamps: true,
  underscored: true
})
export default class Task extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  task_id!: number;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING(100))
  title!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description!: string;

  @AllowNull(false)
  @Index
  @Column(DataType.DATE)
  due_date!: Date;

  @AllowNull(false)
  @Default(TaskStatus.PENDING)
  @Index
  @Column(DataType.ENUM(...Object.values(TaskStatus)))
  status!: TaskStatus;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;
}
