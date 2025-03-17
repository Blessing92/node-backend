import { Request, Response, NextFunction } from 'express';
import { TaskService } from '@/services/task.service';
import { ITaskFilter } from '@/interfaces/task.interface';
import { BadRequestException } from '@/exceptions/http-exception';
import {TaskStatus} from "@/enums/task-status.enum";
import {logger} from "@/config/logger";

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  /**
   * Create a new task
   * @route POST /api/tasks
   */
  public createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskData = req.body;
      const task = await this.taskService.createTask(taskData);

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all tasks with filtering, pagination, and sorting
   * @route GET /api/tasks
   */
  public getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ITaskFilter = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC',
        status: req.query.status as TaskStatus,
        search: req.query.search as string,
        due_date_start: req.query.due_date_start ? new Date(req.query.due_date_start as string) : undefined,
        due_date_end: req.query.due_date_end ? new Date(req.query.due_date_end as string) : undefined
      };

      const { tasks, total } = await this.taskService.getTasks(filters);

      res.status(200).json({
        success: true,
        data: tasks,
        meta: {
          total,
          page: filters.page || 1,
          limit: filters.limit || 10,
          pages: Math.ceil(total / (filters.limit || 10))
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a specific task by ID
   * @route GET /api/tasks/:id
   */
  public getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = parseInt(req.params.id, 10);

      if (isNaN(taskId)) {
        throw new BadRequestException('Invalid task ID');
      }

      const task = await this.taskService.getTaskById(taskId);

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing task
   * @route PUT /api/tasks/:id
   */
  public updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = parseInt(req.params.id, 10);

      if (isNaN(taskId)) {
        throw new BadRequestException('Invalid task ID');
      }

      const taskData = req.body;
      const updatedTask = await this.taskService.updateTask(taskId, taskData);

      res.status(200).json({
        success: true,
        data: updatedTask
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a task
   * @route DELETE /api/tasks/:id
   */
  public deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = parseInt(req.params.id, 10);

      if (isNaN(taskId)) {
        throw new BadRequestException('Invalid task ID');
      }

      await this.taskService.deleteTask(taskId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default new TaskController();
