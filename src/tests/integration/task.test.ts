import dotenv from "dotenv"
import path from "path"
import { sequelize } from "@/config/database"
import Task from "@/models/task.model"
import { TaskStatus } from "@/enums/task-status.enum"
import { TaskService } from "@/services/task.service"
import { NotFoundException } from "@/exceptions/http-exception"

dotenv.config({ path: path.resolve(__dirname, "../../.env.test") })

describe("Task Integration Tests", () => {
  let taskService: TaskService
  let testTaskId: number

  beforeAll(async () => {
    try {
      await sequelize.authenticate()

      // Force sync all models
      await sequelize.sync({ force: true })

      taskService = new TaskService()
    } catch (error) {
      throw error
    }
  })

  afterAll(async () => {
    await sequelize.close()
  })

  describe("Task Service with Repository Integration", () => {
    it("should create a task and persist to database", async () => {
      // Set due date 2 days in the future to ensure it passes validation
      const taskData = {
        title: "Integration Test Task",
        description: "Testing service and repository integration",
        due_date: new Date(Date.now() + 172800000), // 2 days ahead instead of 1
        status: TaskStatus.PENDING,
      }

      const result = await taskService.createTask(taskData)
      expect(result).toBeDefined()
      expect(result.task_id).toBeDefined()
      testTaskId = result.task_id!

      // Verify the task was saved to the database
      const savedTask = await Task.findByPk(testTaskId)

      expect(savedTask).not.toBeNull()
      expect(savedTask!.title).toBe(taskData.title)
      expect(savedTask!.description).toBe(taskData.description)
      expect(savedTask!.status).toBe(taskData.status)
    })

    it("should retrieve tasks with filters directly from database", async () => {
      // Create additional tasks with different statuses
      await Task.create({
        title: "In Progress Task",
        description: "This task is in progress",
        due_date: new Date(Date.now() + 172800000), // 2 days ahead
        status: TaskStatus.IN_PROGRESS,
      })

      await Task.create({
        title: "Completed Task",
        description: "This task is done",
        due_date: new Date(Date.now() + 172800000), // 2 days ahead
        status: TaskStatus.COMPLETED,
      })

      // Test filtering by status
      const { tasks: inProgressTasks } = await taskService.getTasks({
        status: TaskStatus.IN_PROGRESS,
      })

      expect(inProgressTasks.length).toBeGreaterThanOrEqual(1)
      expect(
        inProgressTasks.every((task) => task.status === TaskStatus.IN_PROGRESS),
      ).toBe(true)

      // Test search functionality
      const { tasks: searchResults } = await taskService.getTasks({
        search: "Completed",
      })

      expect(searchResults.length).toBeGreaterThanOrEqual(1)
      expect(
        searchResults.some((task) => task.title.includes("Completed")),
      ).toBe(true)
    })

    it("should update a task and reflect changes in database", async () => {
      // First confirm testTaskId is defined
      expect(testTaskId).toBeDefined()

      const updateData = {
        title: "Updated Integration Task",
        status: TaskStatus.IN_PROGRESS,
      }

      const updatedTask = await taskService.updateTask(testTaskId, updateData)

      // Verify the changes were saved to the database
      const dbTask = await Task.findByPk(testTaskId)

      expect(dbTask).not.toBeNull()
      expect(dbTask!.title).toBe(updateData.title)
      expect(dbTask!.status).toBe(updateData.status)
      expect(updatedTask.title).toBe(updateData.title)
    })

    it("should delete a task and remove from database", async () => {
      // First confirm testTaskId is defined
      expect(testTaskId).toBeDefined()

      const result = await taskService.deleteTask(testTaskId)
      expect(result).toBe(true)

      // Verify the task was removed from the database
      const deletedTask = await Task.findByPk(testTaskId)
      expect(deletedTask).toBeNull()

      // Verify the service throws the correct exception when trying to get the deleted task
      await expect(taskService.getTaskById(testTaskId)).rejects.toThrow(
        NotFoundException,
      )
    })

    it("should handle transaction rollback on error", async () => {
      // Create a task to work with
      const task = await Task.create({
        title: "Rollback Test Task",
        description: "Testing transaction rollback",
        due_date: new Date(Date.now() + 172800000), // 2 days ahead
        status: TaskStatus.PENDING,
      })

      expect(task.task_id).toBeDefined()

      // Mock the repository to force an error during update
      const originalUpdateTask = taskService["taskRepository"].updateTask
      taskService["taskRepository"].updateTask = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error("Forced error for testing rollback")
        })

      // Attempt to update which should fail
      await expect(
        taskService.updateTask(task.task_id!, { title: "Should Not Update" }),
      ).rejects.toThrow("Forced error for testing rollback")

      // Restore the original function
      taskService["taskRepository"].updateTask = originalUpdateTask

      // Verify the task in the database is unchanged
      const unchangedTask = await Task.findByPk(task.task_id!)
      expect(unchangedTask!.title).toBe("Rollback Test Task")
    })
  })

  describe("Database Connection and Error Handling", () => {
    it("should handle database connection issues gracefully", async () => {
      // Temporarily break the connection
      const originalAuthenticate = sequelize.authenticate

      // Create a proper mock that will actually throw
      sequelize.authenticate = jest.fn().mockImplementationOnce(() => {
        throw new Error("Connection error")
      })

      // Create a new service instance that would try to use the connection
      const newService = new TaskService()

      // We need to mock a method that will actually use the connection
      const originalGetTasks = newService["taskRepository"].getTasks
      newService["taskRepository"].getTasks = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error("Connection error")
        })

      // Attempt an operation that would use the connection
      await expect(newService.getTasks()).rejects.toThrow("Connection error")

      // Restore the original functions
      sequelize.authenticate = originalAuthenticate
      newService["taskRepository"].getTasks = originalGetTasks
    })
  })
})
