import { type TaskStatus } from "../enums/task-status.enum"

export interface ITask {
  task_id?: number
  title: string
  description: string
  due_date: Date
  status: TaskStatus
  created_at?: Date
  updated_at?: Date
}

export interface ITaskFilter {
  status?: TaskStatus
  due_date_start?: Date
  due_date_end?: Date
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}
