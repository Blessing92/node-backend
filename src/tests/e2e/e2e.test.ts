import dotenv from "dotenv"
import path from "path"
import request from "supertest"
import { sequelize } from "@/config/database"
import { Op } from "sequelize"
import App from "@/app"
import Task from "@/models/task.model"
import { TaskStatus } from "@/enums/task-status.enum"
import { ITask } from "../../interfaces/task.interface"

dotenv.config({ path: path.resolve(__dirname, "../../.env.test") })

describe("Task API E2E Tests", () => {
  let app: App
  let testTaskId: number
  let testTask1Id: number
  let testTask2Id: number
  let testTask3Id: number

  beforeAll(async () => {
    app = new App()
    await sequelize.sync({ force: true })

    // Create common test data
    const task1 = await Task.create({
      title: "Task 1",
      description: "Description 1",
      due_date: new Date().toISOString().slice(0, 10),
      status: TaskStatus.PENDING,
    })
    testTask1Id = task1.task_id

    const task2 = await Task.create({
      title: "Task 2",
      description: "Description 2",
      due_date: new Date().toISOString().slice(0, 10),
      status: TaskStatus.IN_PROGRESS,
    })
    testTask2Id = task2.task_id

    const task3 = await Task.create({
      title: "Task 3",
      description: "Description 3",
      due_date: new Date().toISOString().slice(0, 10),
      status: TaskStatus.COMPLETED,
    })
    testTask3Id = task3.task_id
  })

  afterAll(async () => {
    await sequelize.close()
  })

  afterEach(async () => {
    // Clean up tasks after each test except our tracked test tasks
    await Task.destroy({
      where: {
        task_id: {
          [Op.notIn]: [
            testTaskId,
            testTask1Id,
            testTask2Id,
            testTask3Id,
          ].filter(Boolean),
        },
      },
    })
  })

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        due_date: new Date(Date.now() + 86400000),
        status: TaskStatus.COMPLETED,
      }

      const response = await request(app.app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty("task_id")
      expect(response.body.data.title).toBe(taskData.title)
      expect(response.body.data.description).toBe(taskData.description)
      expect(response.body.data.status).toBe(taskData.status)

      // Store the id for later tests
      testTaskId = response.body.data.task_id
    })

    it("should return 400 when creating task with invalid data", async () => {
      const invalidData = {
        description: "Test Description",
        status: "INVALID_STATUS",
      }

      const response = await request(app.app)
        .post("/api/tasks")
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body).toHaveProperty("message")
    })
  })

  describe("GET /api/tasks", () => {
    it("should return tasks with pagination", async () => {
      const response = await request(app.app)
        .get("/api/tasks?page=1&limit=2")
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.meta.total).toBeGreaterThanOrEqual(3)
      expect(response.body.meta.page).toBe(1)
      expect(response.body.meta.limit).toBe(2)
    })

    it("should filter tasks by status", async () => {
      const response = await request(app.app)
        .get(`/api/tasks?status=${TaskStatus.IN_PROGRESS}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(
        response.body.data.every(
          (task: ITask) => task.status === TaskStatus.IN_PROGRESS,
        ),
      ).toBe(true)
    })

    it("should search tasks by term", async () => {
      const response = await request(app.app)
        .get("/api/tasks?search=Task 2")
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(
        response.body.data.some((task: ITask) => task.title === "Task 2"),
      ).toBe(true)
    })
  })

  describe("GET /api/tasks/:id", () => {
    it("should return a specific task by ID", async () => {
      const response = await request(app.app)
        .get(`/api/tasks/${testTaskId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.task_id).toBe(testTaskId)
      expect(response.body.data.title).toBe("Test Task")
    })

    it("should return 404 for non-existent task ID", async () => {
      const nonExistentId = 9999

      const response = await request(app.app)
        .get(`/api/tasks/${nonExistentId}`)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain("not found")
    })
  })

  describe("PUT /api/tasks/:id", () => {
    it("should update an existing task", async () => {
      const updateData = {
        title: "Updated Task Title",
        status: TaskStatus.IN_PROGRESS,
      }

      const response = await request(app.app)
        .put(`/api/tasks/${testTaskId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.task_id).toBe(testTaskId)
      expect(response.body.data.title).toBe(updateData.title)
      expect(response.body.data.status).toBe(updateData.status)
    })

    it("should return 400 when updating with invalid data", async () => {
      const invalidData = {
        status: "INVALID_STATUS",
      }

      const response = await request(app.app)
        .put(`/api/tasks/${testTaskId}`)
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe("DELETE /api/tasks/:id", () => {
    it("should delete an existing task", async () => {
      await request(app.app).delete(`/api/tasks/${testTaskId}`).expect(204)

      // Try to get the deleted task and expect 404
      const getResponse = await request(app.app)
        .get(`/api/tasks/${testTaskId}`)
        .expect(404)

      expect(getResponse.body.success).toBe(false)
    })

    it("should return 404 when deleting non-existent task", async () => {
      const response = await request(app.app)
        .delete("/api/tasks/9999")
        .expect(404)

      expect(response.body.success).toBe(false)
    })
  })

  describe("Health Check", () => {
    it("should return 200 for /health endpoint", async () => {
      const response = await request(app.app).get("/health").expect(200)

      expect(response.body.status).toBe("ok")
    })
  })
})
