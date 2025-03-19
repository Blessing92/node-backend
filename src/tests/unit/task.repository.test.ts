import { Op, Transaction } from "sequelize"
import Task from "../../models/task.model"
import { TaskRepository } from "../../repositories/task.repository"
import { type ITask, ITaskFilter } from "../../interfaces/task.interface"
import { NotFoundException } from "../../exceptions/http-exception"
import { TaskStatus } from "../../enums/task-status.enum"

// Mock dependencies
jest.mock("../../models/task.model")
jest.mock("../../config/logger", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}))

describe("TaskRepository", () => {
  let taskRepository: TaskRepository
  let mockTransaction: Transaction

  const mockTaskData: ITask = {
    title: "Test Task",
    description: "Test Description",
    due_date: new Date(Date.now() + 86400000),
    status: TaskStatus.PENDING,
  }

  const mockTaskResponse = {
    task_id: 1,
    title: "Test Task",
    description: "Test Description",
    due_date: new Date(),
    status: "pending",
    created_at: new Date(),
    updated_at: new Date(),
    toJSON: jest.fn().mockReturnValue({
      task_id: 1,
      title: "Test Task",
      description: "Test Description",
      due_date: new Date(),
      status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    }),
  }

  beforeEach(() => {
    taskRepository = new TaskRepository()
    mockTransaction = {} as Transaction
    jest.clearAllMocks()
  })

  describe("createTask", () => {
    it("should create a task and return it", async () => {
      // Arrange
      ;(Task.create as jest.Mock).mockResolvedValueOnce(mockTaskResponse)

      // Act
      const result = await taskRepository.createTask(
        mockTaskData,
        mockTransaction,
      )

      // Assert
      expect(Task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockTaskData.title,
          description: mockTaskData.description,
          status: mockTaskData.status,
        }),
        { transaction: mockTransaction },
      )
      expect(result).toEqual(mockTaskResponse.toJSON())
    })

    it("should throw an error if validation fails", async () => {
      // Arrange
      const invalidTaskData = {
        title: "",
        description: "Test Description",
        status: "invalid_status",
      }

      // Act & Assert
      await expect(
        taskRepository.createTask(invalidTaskData as ITask),
      ).rejects.toThrow(/Invalid task data/)
      expect(Task.create).not.toHaveBeenCalled()
    })
  })

  describe("getTasks", () => {
    it("should return tasks and total count with default pagination", async () => {
      const mockRows = [mockTaskResponse]
      const mockCount = 1

      ;(Task.findAndCountAll as jest.Mock).mockResolvedValueOnce({
        rows: mockRows,
        count: mockCount,
      })

      // Act
      const result = await taskRepository.getTasks()

      // Assert
      expect(Task.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
          order: [["due_date", "ASC"]],
        }),
      )
      expect(result).toEqual({
        tasks: [mockTaskResponse.toJSON()],
        total: mockCount,
      })
    })

    it("should apply filters when provided", async () => {
      // Arrange
      const filters = {
        page: 2,
        limit: 5,
        sortBy: "title",
        sortOrder: "DESC" as const,
        status: "in-progress" as const,
        search: "test",
        due_date_start: new Date("2023-01-01"),
        due_date_end: new Date("2023-12-31"),
      } as ITaskFilter

      ;(Task.findAndCountAll as jest.Mock).mockResolvedValueOnce({
        rows: [mockTaskResponse],
        count: 1,
      })

      await taskRepository.getTasks(filters)

      expect(Task.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: filters.limit,
          offset: 5, // (page-1) * limit = (2-1) * 5 = 5
          order: [[filters.sortBy, filters.sortOrder]],
          where: expect.objectContaining({
            status: filters.status,
            due_date: {
              [Op.between]: [filters.due_date_start, filters.due_date_end],
            },
            [Op.or]: [
              { title: { [Op.like]: `%${filters.search}%` } },
              { description: { [Op.like]: `%${filters.search}%` } },
            ],
          }),
        }),
      )
    })

    it("should throw an error for invalid pagination parameters", async () => {
      const invalidFilters = {
        page: -1, // Invalid page number
        limit: 10000, // Too large limit
      }

      await expect(taskRepository.getTasks(invalidFilters)).rejects.toThrow(
        /Invalid query parameters/,
      )
      expect(Task.findAndCountAll).not.toHaveBeenCalled()
    })
  })

  describe("getTaskById", () => {
    it("should return a task when found", async () => {
      ;(Task.findByPk as jest.Mock).mockResolvedValueOnce(mockTaskResponse)

      const result = await taskRepository.getTaskById(1)

      expect(Task.findByPk).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockTaskResponse.toJSON())
    })

    it("should throw NotFoundException when task not found", async () => {
      ;(Task.findByPk as jest.Mock).mockResolvedValueOnce(null)

      await expect(taskRepository.getTaskById(999)).rejects.toThrow(
        NotFoundException,
      )
      expect(Task.findByPk).toHaveBeenCalledWith(999)
    })
  })

  describe("updateTask", () => {
    it("should update and return the task when found", async () => {
      const mockUpdate = jest.fn().mockResolvedValueOnce([1])
      const mockTask = {
        ...mockTaskResponse,
        update: mockUpdate,
      }

      ;(Task.findByPk as jest.Mock).mockResolvedValueOnce(mockTask)

      const updateData = {
        title: "Updated Title",
        status: "completed" as const,
      } as Partial<ITask>

      const result = await taskRepository.updateTask(
        1,
        updateData,
        mockTransaction,
      )

      expect(Task.findByPk).toHaveBeenCalledWith(1, {
        transaction: mockTransaction,
      })
      expect(mockUpdate).toHaveBeenCalledWith(updateData, {
        transaction: mockTransaction,
      })
      expect(result).toEqual(mockTask.toJSON())
    })

    it("should throw NotFoundException when task not found", async () => {
      ;(Task.findByPk as jest.Mock).mockResolvedValueOnce(null)

      await expect(
        taskRepository.updateTask(999, { title: "New Title" }),
      ).rejects.toThrow(NotFoundException)
    })

    it("should throw error for invalid update data", async () => {
      const invalidUpdateData = {
        status: "invalid_status" as TaskStatus, // Invalid status
      }

      await expect(
        taskRepository.updateTask(1, invalidUpdateData),
      ).rejects.toThrow(/Invalid update data/)
      expect(Task.findByPk).not.toHaveBeenCalled()
    })
  })

  describe("deleteTask", () => {
    it("should delete and return true when task found", async () => {
      // Arrange
      const mockDestroy = jest.fn().mockResolvedValueOnce(true)
      const mockTask = {
        ...mockTaskResponse,
        destroy: mockDestroy,
      }

      ;(Task.findByPk as jest.Mock).mockResolvedValueOnce(mockTask)

      // Act
      const result = await taskRepository.deleteTask(1, mockTransaction)

      // Assert
      expect(Task.findByPk).toHaveBeenCalledWith(1, {
        transaction: mockTransaction,
      })
      expect(mockDestroy).toHaveBeenCalledWith({ transaction: mockTransaction })
      expect(result).toBe(true)
    })

    it("should throw NotFoundException when task not found", async () => {
      // Arrange
      ;(Task.findByPk as jest.Mock).mockResolvedValueOnce(null)

      // Act & Assert
      await expect(taskRepository.deleteTask(999)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
