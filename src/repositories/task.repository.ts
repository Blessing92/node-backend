import { type Transaction, Op, type WhereOptions } from "sequelize"
import Task from "@/models/task.model"
import {
  createTaskSchema,
  updateTaskSchema,
  paginationSchema,
} from "@/dto/task.dto"
import { type ITask, type ITaskFilter } from "@/interfaces/task.interface"
import { logger } from "@/config/logger"
import { NotFoundException } from "@/exceptions/http-exception"
// import { cache } from '../utils/cache.util';

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

    // Validate input data against schema
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

    // Invalidate cache for list endpoints
    // await this.invalidateListCache();

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
    // Validate and apply defaults to query parameters
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

    // Generate cache key based on query parameters
    // const cacheKey = `tasks:filtered:${JSON.stringify({ page, limit, sortBy, sortOrder, status, search, due_date_start: filters?.due_date_start, due_date_end: filters?.due_date_end })}`

    // Try to get from cache first
    // const cachedResult = await cache.get(cacheKey);
    // if (cachedResult) {
    //   logger.debug('Returning tasks from cache', { cacheKey });
    //   return JSON.parse(cachedResult);
    // }

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
      // Use attributes to select only needed fields
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

    // Cache the result for 5 minutes
    // await cache.set(cacheKey, JSON.stringify(result), 'EX', 300);

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

    // Try to get from cache first
    // const cacheKey = `task:${taskId}`
    // const cachedTask = await cache.get(cacheKey);
    //
    // if (cachedTask) {
    //   logger.debug('Returning task from cache', { taskId });
    //   return JSON.parse(cachedTask);
    // }

    const task = await Task.findByPk(taskId)

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`)
    }

    const taskData = task.toJSON()

    // Cache the result for 5 minutes
    // await cache.set(cacheKey, JSON.stringify(taskData), 'EX', 300);

    return taskData
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

    // Update task
    await task.update(value, { transaction })

    // Invalidate caches
    // await cache.del(`task:${taskId}`);
    // await this.invalidateListCache();

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

    // Invalidate caches
    // await cache.del(`task:${taskId}`);
    // await this.invalidateListCache();

    return true
  }

  /**
   * Helper method to invalidate all list-related caches
   */
  // private async invalidateListCache(): Promise<void> {
  //   await cache.del('tasks:all*');
  //   await cache.del('tasks:filtered:*');
  // }
}

export default new TaskRepository()
