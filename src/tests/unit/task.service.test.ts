import { Transaction } from "sequelize"
import { TaskService } from "@/services/task.service"
import { TaskRepository } from "@/repositories/task.repository"
import { type ITask, type ITaskFilter } from "@/interfaces/task.interface"
import { TaskStatus } from "@/enums/task-status.enum"
import { sequelize } from "@/config/database"
import {
  BadRequestException,
  NotFoundException,
} from "@/exceptions/http-exception"
import { logger } from "@/config/logger"

// Mock dependencies
jest.mock("@/repositories/task.repository")
jest.mock("@/config/database", () => ({
  sequelize: {
    transaction: jest.fn(),
  },
}))
jest.mock("@/config/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

describe("TaskService", () => {
  let taskService: TaskService
  let mockTaskRepository: jest.Mocked<TaskRepository>
  let mockTransaction: Transaction

  const mockTaskData: ITask = {
    title: "Test Task",
    description: "Test Description",
    due_date: new Date(),
    status: TaskStatus.PENDING,
  }

  const mockTaskResponse = {
    task_id: 1,
    title: "Test Task",
    description: "Test Description",
    due_date: new Date(),
    status: TaskStatus.PENDING,
    created_at: new Date(),
    updated_at: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    } as unknown as Transaction

    // Setup sequelize transaction mock
    ;(sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction)

    // Reset the TaskRepository mock
    jest.mocked(TaskRepository).mockClear()

    mockTaskRepository = {
      createTask: jest.fn(),
      getTasks: jest.fn(),
      getTaskById: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    } as unknown as jest.Mocked<TaskRepository>

    // Mock the TaskRepository constructor
    ;(
      TaskRepository as jest.MockedClass<typeof TaskRepository>
    ).mockImplementation(() => {
      return mockTaskRepository
    })

    // Create the service with the mocked repository
    taskService = new TaskService()
  })

  describe("createTask", () => {
    it("should create a task successfully", async () => {
      mockTaskRepository.createTask.mockResolvedValueOnce(mockTaskResponse)

      const result = await taskService.createTask(mockTaskData)

      expect(sequelize.transaction).toHaveBeenCalled()
      expect(mockTaskRepository.createTask).toHaveBeenCalledWith(
        mockTaskData,
        mockTransaction,
      )
      expect(mockTransaction.commit).toHaveBeenCalled()
      expect(mockTransaction.rollback).not.toHaveBeenCalled()
      expect(result).toEqual(mockTaskResponse)
    })

    it("should throw BadRequestException and rollback transaction when validation fails", async () => {
      const validationError = new Error("Title is required")
      mockTaskRepository.createTask.mockRejectedValueOnce(validationError)

      await expect(taskService.createTask(mockTaskData)).rejects.toThrow(
        BadRequestException,
      )
      expect(mockTaskRepository.createTask).toHaveBeenCalledWith(
        mockTaskData,
        mockTransaction,
      )
      expect(mockTransaction.commit).not.toHaveBeenCalled()
      expect(mockTransaction.rollback).toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalled()
    })

    it("should propagate unknown errors after rollback", async () => {
      const unknownError = new Error("Database connection error")
      mockTaskRepository.createTask.mockRejectedValueOnce(unknownError)

      await expect(taskService.createTask(mockTaskData)).rejects.toThrow(
        "Database connection error",
      )
      expect(mockTransaction.rollback).toHaveBeenCalled()
    })
  })

  describe("getTasks", () => {
    const mockFilters: ITaskFilter = {
      page: 1,
      limit: 10,
      sortBy: "due_date",
      sortOrder: "ASC",
      status: TaskStatus.PENDING,
    }

    const mockTasksResponse = {
      tasks: [mockTaskResponse],
      total: 1,
    }

    it("should retrieve tasks with filters", async () => {
      mockTaskRepository.getTasks.mockResolvedValueOnce(mockTasksResponse)

      const result = await taskService.getTasks(mockFilters)

      expect(mockTaskRepository.getTasks).toHaveBeenCalledWith(mockFilters)
      expect(result).toEqual(mockTasksResponse)
    })

    it("should throw BadRequestException when filtering fails", async () => {
      const validationError = new Error("Invalid query parameters")
      mockTaskRepository.getTasks.mockRejectedValueOnce(validationError)

      await expect(taskService.getTasks(mockFilters)).rejects.toThrow(
        BadRequestException,
      )
      expect(logger.error).toHaveBeenCalled()
    })

    it("should work with default parameters when no filters provided", async () => {
      mockTaskRepository.getTasks.mockResolvedValueOnce(mockTasksResponse)

      const result = await taskService.getTasks()

      expect(mockTaskRepository.getTasks).toHaveBeenCalledWith(undefined)
      expect(result).toEqual(mockTasksResponse)
    })
  })

  describe("getTaskById", () => {
    it("should retrieve a task by id", async () => {
      mockTaskRepository.getTaskById.mockResolvedValueOnce(mockTaskResponse)

      const result = await taskService.getTaskById(1)

      expect(mockTaskRepository.getTaskById).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockTaskResponse)
    })

    it("should propagate NotFoundException when task not found", async () => {
      const notFoundError = new NotFoundException("Task with ID 999 not found")
      mockTaskRepository.getTaskById.mockRejectedValueOnce(notFoundError)

      await expect(taskService.getTaskById(999)).rejects.toThrow(
        NotFoundException,
      )
      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe("updateTask", () => {
    const updateData: Partial<ITask> = {
      title: "Updated Title",
      status: TaskStatus.COMPLETED,
    }

    it("should update a task successfully", async () => {
      const updatedTaskResponse = { ...mockTaskResponse, ...updateData }
      mockTaskRepository.updateTask.mockResolvedValueOnce(updatedTaskResponse)

      const result = await taskService.updateTask(1, updateData)

      expect(sequelize.transaction).toHaveBeenCalled()
      expect(mockTaskRepository.updateTask).toHaveBeenCalledWith(
        1,
        updateData,
        mockTransaction,
      )
      expect(mockTransaction.commit).toHaveBeenCalled()
      expect(mockTransaction.rollback).not.toHaveBeenCalled()
      expect(result).toEqual(updatedTaskResponse)
    })

    it("should throw and rollback transaction when update fails", async () => {
      const notFoundError = new NotFoundException("Task with ID 999 not found")
      mockTaskRepository.updateTask.mockRejectedValueOnce(notFoundError)

      await expect(taskService.updateTask(999, updateData)).rejects.toThrow(
        NotFoundException,
      )
      expect(mockTransaction.commit).not.toHaveBeenCalled()
      expect(mockTransaction.rollback).toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalled()
    })

    it("should rollback and propagate validation errors", async () => {
      const validationError = new Error("Invalid status value")
      mockTaskRepository.updateTask.mockRejectedValueOnce(validationError)

      await expect(
        taskService.updateTask(1, { status: "invalid" as any }),
      ).rejects.toThrow("Invalid status value")
      expect(mockTransaction.rollback).toHaveBeenCalled()
    })
  })

  describe("deleteTask", () => {
    it("should delete a task successfully", async () => {
      mockTaskRepository.deleteTask.mockResolvedValueOnce(true)

      const result = await taskService.deleteTask(1)

      expect(sequelize.transaction).toHaveBeenCalled()
      expect(mockTaskRepository.deleteTask).toHaveBeenCalledWith(
        1,
        mockTransaction,
      )
      expect(mockTransaction.commit).toHaveBeenCalled()
      expect(mockTransaction.rollback).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it("should throw and rollback transaction when task not found", async () => {
      const notFoundError = new NotFoundException("Task with ID 999 not found")
      mockTaskRepository.deleteTask.mockRejectedValueOnce(notFoundError)

      await expect(taskService.deleteTask(999)).rejects.toThrow(
        NotFoundException,
      )
      expect(mockTransaction.commit).not.toHaveBeenCalled()
      expect(mockTransaction.rollback).toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalled()
    })

    it("should handle and propagate unexpected errors during deletion", async () => {
      const unexpectedError = new Error("Database connection lost")
      mockTaskRepository.deleteTask.mockRejectedValueOnce(unexpectedError)

      await expect(taskService.deleteTask(1)).rejects.toThrow(
        "Database connection lost",
      )
      expect(mockTransaction.rollback).toHaveBeenCalled()
    })
  })
})
