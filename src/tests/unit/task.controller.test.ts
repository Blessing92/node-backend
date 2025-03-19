import { Request, Response, NextFunction } from "express"
import { TaskController } from "../../controllers/task.controller"
import { TaskService } from "../../services/task.service"
import { BadRequestException } from "../../exceptions/http-exception"
import { TaskStatus } from "../../enums/task-status.enum"

// Mock TaskService
jest.mock("../../services/task.service")

describe("TaskController", () => {
  let taskController: TaskController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let mockTaskService: jest.Mocked<TaskService>

  beforeEach(() => {
    mockTaskService = new TaskService() as jest.Mocked<TaskService>
    taskController = new TaskController()
    // @ts-ignore - Override the private service property
    taskController.taskService = mockTaskService

    mockRequest = {}
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    }
    mockNext = jest.fn()
  })

  describe("createTask", () => {
    it("should create a task and return 201 status", async () => {
      const mockTask = {
        task_id: 1,
        title: "Test Task",
        description: "Test Description",
        due_date: new Date(),
        status: TaskStatus.PENDING,
      }

      mockRequest.body = {
        title: "Test Task",
        description: "Test Description",
        due_date: new Date(),
        status: TaskStatus.PENDING,
      }

      mockTaskService.createTask = jest.fn().mockResolvedValue(mockTask)

      await taskController.createTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockTaskService.createTask).toHaveBeenCalledWith(mockRequest.body)
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTask,
      })
    })

    it("should pass error to next middleware if task creation fails", async () => {
      const error = new Error("Creation failed")
      mockRequest.body = { title: "Test Task" }
      mockTaskService.createTask = jest.fn().mockRejectedValue(error)

      await taskController.createTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })

  describe("getTasks", () => {
    it("should get all tasks and return 200 status", async () => {
      const mockTasks = [
        {
          task_id: 1,
          title: "Task 1",
          description: "Description 1",
          due_date: new Date(),
          status: TaskStatus.PENDING,
        },
      ]

      mockRequest.query = {
        page: "1",
        limit: "10",
      }

      mockTaskService.getTasks = jest.fn().mockResolvedValue({
        tasks: mockTasks,
        total: 1,
      })

      await taskController.getTasks(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockTaskService.getTasks).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: undefined,
        sortOrder: undefined,
        status: undefined,
        search: undefined,
        due_date_start: undefined,
        due_date_end: undefined,
      })

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTasks,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
        },
      })
    })

    it("should handle invalid page and limit query parameters", async () => {
      mockRequest.query = {
        page: "invalid",
        limit: "invalid",
      }

      await taskController.getTasks(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockTaskService.getTasks).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: undefined,
        sortOrder: undefined,
        status: undefined,
        search: undefined,
        due_date_start: undefined,
        due_date_end: undefined,
      })
    })

    it("should pass error to next middleware if getting tasks fails", async () => {
      const error = new Error("Get tasks failed")
      mockRequest.query = { page: "1", limit: "10" }
      mockTaskService.getTasks = jest.fn().mockRejectedValue(error)

      await taskController.getTasks(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })

  describe("getTaskById", () => {
    it("should get a task by ID and return 200 status", async () => {
      const mockTask = {
        task_id: 1,
        title: "Test Task",
        description: "Test Description",
        due_date: new Date(),
        status: TaskStatus.PENDING,
      }

      mockRequest.params = { id: "1" }
      mockTaskService.getTaskById = jest.fn().mockResolvedValue(mockTask)

      await taskController.getTaskById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockTaskService.getTaskById).toHaveBeenCalledWith(1)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTask,
      })
    })

    it("should throw BadRequestException for invalid task ID", async () => {
      mockRequest.params = { id: "invalid" }

      await taskController.getTaskById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException))
    })

    it("should pass error to next middleware if getting task by ID fails", async () => {
      const error = new Error("Get task by ID failed")
      mockRequest.params = { id: "1" }
      mockTaskService.getTaskById = jest.fn().mockRejectedValue(error)

      await taskController.getTaskById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })

  describe("updateTask", () => {
    it("should update a task and return 200 status", async () => {
      const mockTask = {
        task_id: 1,
        title: "Updated Task",
        description: "Updated Description",
        due_date: new Date(),
        status: TaskStatus.COMPLETED,
      }

      mockRequest.params = { id: "1" }
      mockRequest.body = {
        title: "Updated Task",
        description: "Updated Description",
        status: TaskStatus.COMPLETED,
      }

      mockTaskService.updateTask = jest.fn().mockResolvedValue(mockTask)

      await taskController.updateTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockTaskService.updateTask).toHaveBeenCalledWith(
        1,
        mockRequest.body,
      )
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTask,
      })
    })

    it("should throw BadRequestException for invalid task ID", async () => {
      mockRequest.params = { id: "invalid" }

      await taskController.updateTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException))
    })

    it("should pass error to next middleware if updating task fails", async () => {
      const error = new Error("Update task failed")
      mockRequest.params = { id: "1" }
      mockRequest.body = { title: "Updated Task" }
      mockTaskService.updateTask = jest.fn().mockRejectedValue(error)

      await taskController.updateTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })

  describe("deleteTask", () => {
    it("should delete a task and return 204 status", async () => {
      mockRequest.params = { id: "1" }
      mockTaskService.deleteTask = jest.fn().mockResolvedValue(true)

      await taskController.deleteTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1)
      expect(mockResponse.status).toHaveBeenCalledWith(204)
      expect(mockResponse.send).toHaveBeenCalled()
    })

    it("should throw BadRequestException for invalid task ID", async () => {
      mockRequest.params = { id: "invalid" }

      await taskController.deleteTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException))
    })

    it("should pass error to next middleware if deleting task fails", async () => {
      const error = new Error("Delete task failed")
      mockRequest.params = { id: "1" }
      mockTaskService.deleteTask = jest.fn().mockRejectedValue(error)

      await taskController.deleteTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })
})
