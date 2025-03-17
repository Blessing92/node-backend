import { Transaction } from 'sequelize';
import { TaskRepository } from '@/repositories/task.repository';
import { ITask, ITaskFilter } from '@/interfaces/task.interface';
import { logger } from '@/config/logger';
import { sequelize } from '@/config/database';
import { BadRequestException } from '@/exceptions/http-exception';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  /**
   * Create a new task
   * @param taskData - Task data to create
   * @returns Created task
   */
  public async createTask(taskData: ITask): Promise<ITask> {
    logger.info('Creating new task', { title: taskData.title });

    // Use transaction to ensure data consistency
    const transaction: Transaction = await sequelize.transaction();

    try {
      const task = await this.taskRepository.createTask(taskData, transaction);
      await transaction.commit();
      return task;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to create task', { error });

      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * Get all tasks with filtering, pagination, and sorting
   * @param filters - Filter criteria
   * @returns Array of tasks and total count
   */
  public async getTasks(filters?: ITaskFilter): Promise<{ tasks: ITask[]; total: number }> {
    logger.info('Getting tasks with filters', { filters });

    try {
      return await this.taskRepository.getTasks(filters);
    } catch (error) {
      logger.error('Failed to get tasks', { error });

      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * Get a specific task by ID
   * @param taskId - Task ID to retrieve
   * @returns Task details
   */
  public async getTaskById(taskId: number): Promise<ITask> {
    logger.info('Getting task by ID', { taskId });

    try {
      return await this.taskRepository.getTaskById(taskId);
    } catch (error) {
      logger.error('Failed to get task by ID', { taskId, error });
      throw error;
    }
  }

  /**
   * Update an existing task
   * @param taskId - Task ID to update
   * @param taskData - Updated task data
   * @returns Updated task
   */
  public async updateTask(taskId: number, taskData: Partial<ITask>): Promise<ITask> {
    logger.info('Updating task', { taskId, data: taskData });

    // Use transaction to ensure data consistency
    const transaction: Transaction = await sequelize.transaction();

    try {
      const task = await this.taskRepository.updateTask(taskId, taskData, transaction);
      await transaction.commit();
      return task;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update task', { taskId, error });
      throw error;
    }
  }

  /**
   * Delete a task
   * @param taskId - Task ID to delete
   * @returns True if deleted
   */
  public async deleteTask(taskId: number): Promise<boolean> {
    logger.info('Deleting task', { taskId });

    // Use transaction to ensure data consistency
    const transaction: Transaction = await sequelize.transaction();

    try {
      const result = await this.taskRepository.deleteTask(taskId, transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to delete task', { taskId, error });
      throw error;
    }
  }
}

export default new TaskService();
