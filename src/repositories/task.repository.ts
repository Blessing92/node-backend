import { type Transaction, Op, type WhereOptions } from "sequelize"
import Task from "../models/task.model"
import {
  createTaskSchema,
  updateTaskSchema,
  paginationSchema,
} from "../dto/task.dto"
import { type ITask, type ITaskFilter } from "../interfaces/task.interface"
import { logger } from "../config/logger"
import { NotFoundException } from "../exceptions/http-exception"

export class TaskRepository {
  /**
   * Create a new task
   * @param taskData - Task data transfer object
   * @param transaction - Optional sequelize transaction
   * @returns Created task
   */
  public async createTask(
    taskData: ITask,
    transaction?: Transaction,
  ): Promise<ITask> {
    logger.debug("Creating new task", { title: taskData.title })

    const { error, value } = createTaskSchema.validate(taskData, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    })
    if (error) {
      logger.error(
        "Validation error: ",
        error.details.map((d) => d.message),
      )
      throw new Error(
        `Invalid task data: ${error.details.map((d) => d.message).join(", ")}`,
      )
    }

    const task = await Task.create(value, { transaction })

    return await task.toJSON()
  }

  /**
   * Get all tasks with pagination, sorting and advanced filtering
   * @param filters - Filter and pagination criteria
   * @returns Array of tasks and total count
   */
  public async getTasks(
    filters?: ITaskFilter,
  ): Promise<{ tasks: ITask[]; total: number }> {
    const { error, value } = paginationSchema.validate(filters ?? {})
    if (error) {
      throw new Error(`Invalid query parameters: ${error.message}`)
    }

    const {
      page = 1,
      limit = 10,
      sortBy = "due_date",
      sortOrder = "ASC",
      status,
      search,
    } = value

    const offset = (page - 1) * limit

    // Build query conditions based on filters
    const where: WhereOptions = {}

    if (status) {
      where.status = status
    }

    if (filters?.due_date_start && filters?.due_date_end) {
      where.due_date = {
        [Op.between]: [filters.due_date_start, filters.due_date_end],
      }
    } else if (filters?.due_date_start) {
      where.due_date = {
        [Op.gte]: filters.due_date_start,
      }
    } else if (filters?.due_date_end) {
      where.due_date = {
        [Op.lte]: filters.due_date_end,
      }
    }

    if (search) {
      where[Op.or as keyof WhereOptions] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ]
    }

    logger.debug("Fetching tasks from database", {
      page,
      limit,
      offset,
      sortBy,
      sortOrder,
      filters,
    })

    // Execute optimized query with proper indexing
    const { rows, count } = await Task.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      attributes: [
        "task_id",
        "title",
        "description",
        "due_date",
        "status",
        "created_at",
        "updated_at",
      ],
    })

    const result = {
      tasks: rows.map((task) => task.toJSON()),
      total: count,
    }

    return result
  }

  /**
   * Get a task by its ID
   * @param taskId - Task unique identifier
   * @returns Task details or null if not found
   * @throws NotFoundException if task doesn't exist
   */
  public async getTaskById(taskId: number): Promise<ITask> {
    logger.debug("Fetching task by ID", { taskId })

    const task = await Task.findByPk(taskId)

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`)
    }

    return task.toJSON()
  }

  /**
   * Update an existing task
   * @param taskId - Task unique identifier
   * @param taskData - Updated task data
   * @param transaction - Optional sequelize transaction
   * @returns Updated task
   * @throws NotFoundException if task doesn't exist
   */
  public async updateTask(
    taskId: number,
    taskData: Partial<ITask>,
    transaction?: Transaction,
  ): Promise<ITask> {
    logger.debug("Updating task", { taskId, ...taskData })

    const { error, value } = updateTaskSchema.validate(taskData)
    if (error) {
      throw new Error(`Invalid update data: ${error.message}`)
    }

    const task = await Task.findByPk(taskId, { transaction })

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`)
    }

    await task.update(value, { transaction })

    return await task.toJSON()
  }

  /**
   * Delete a task by its ID
   * @param taskId - Task unique identifier
   * @param transaction - Optional sequelize transaction
   * @returns True if deleted
   * @throws NotFoundError if task doesn't exist
   */
  public async deleteTask(
    taskId: number,
    transaction?: Transaction,
  ): Promise<boolean> {
    logger.debug("Deleting task", { taskId })

    const task = await Task.findByPk(taskId, { transaction })

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`)
    }

    await task.destroy({ transaction })

    return true
  }
}

export default new TaskRepository()
