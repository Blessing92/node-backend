import { type Request, type Response, type NextFunction } from "express"
import { TaskService } from "@/services/task.service"
import { type ITask, type ITaskFilter } from "@/interfaces/task.interface"
import { BadRequestException } from "@/exceptions/http-exception"
import { type TaskStatus } from "@/enums/task-status.enum"

export class TaskController {
  private readonly taskService: TaskService

  constructor(taskService?: TaskService) {
    this.taskService = taskService || new TaskService()
  }

  /**
   * Create a new task
   * @route POST /api/tasks
   */
  public createTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const taskData = req.body as ITask
      const task = await this.taskService.createTask(taskData)

      res.status(201).json({
        success: true,
        data: task,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get all tasks with filtering, pagination, and sorting
   * @route GET /api/tasks
   */
  public getTasks = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10

      const filters: ITaskFilter = {
        page: isNaN(page) ? 1 : page,
        limit: isNaN(limit) ? 10 : limit,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "ASC" | "DESC",
        status: req.query.status as TaskStatus,
        search: req.query.search as string,
        due_date_start: req.query.due_date_start
          ? new Date(req.query.due_date_start as string)
          : undefined,
        due_date_end: req.query.due_date_end
          ? new Date(req.query.due_date_end as string)
          : undefined,
      }

      const { tasks, total } = await this.taskService.getTasks(filters)

      res.status(200).json({
        success: true,
        data: tasks,
        meta: {
          total,
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
          pages: Math.ceil(total / (filters.limit ?? 10)),
        },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get a specific task by ID
   * @route GET /api/tasks/:id
   */
  public getTaskById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const taskId = parseInt(req.params.id, 10)

      if (isNaN(taskId)) {
        throw new BadRequestException("Invalid task ID")
      }

      const task = await this.taskService.getTaskById(taskId)

      res.status(200).json({
        success: true,
        data: task,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update an existing task
   * @route PUT /api/tasks/:id
   */
  public updateTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const taskId = parseInt(req.params.id, 10)

      if (isNaN(taskId)) {
        throw new BadRequestException("Invalid task ID")
      }

      const taskData = req.body as Partial<ITask>
      const updatedTask = await this.taskService.updateTask(taskId, taskData)

      res.status(200).json({
        success: true,
        data: updatedTask,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Delete a task
   * @route DELETE /api/tasks/:id
   */
  public deleteTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const taskId = parseInt(req.params.id, 10)

      if (isNaN(taskId)) {
        throw new BadRequestException("Invalid task ID")
      }

      await this.taskService.deleteTask(taskId)

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}

export default new TaskController()
