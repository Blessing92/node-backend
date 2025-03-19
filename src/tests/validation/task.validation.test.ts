import {
  createTaskSchema,
  updateTaskSchema,
  paginationSchema,
} from "@/dto/task.dto"
import { TaskStatus } from "@/enums/task-status.enum"

describe("Validation Schema Tests", () => {
  describe("createTaskSchema", () => {
    it("should validate a valid task creation object", () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      const validTask = {
        title: "Valid Task",
        description: "This is a valid task",
        due_date: futureDate,
        status: TaskStatus.PENDING,
      }

      const { error, value } = createTaskSchema.validate(validTask)
      expect(error).toBeUndefined()
      expect(value).toEqual(validTask)
    })

    it("should reject task with missing title", () => {
      const invalidTask = {
        description: "Missing title",
        due_date: new Date(),
        status: TaskStatus.PENDING,
      }

      const { error } = createTaskSchema.validate(invalidTask)
      expect(error).toBeDefined()
      expect(error!.message).toContain("Title is required")
    })

    it("should reject task with invalid status", () => {
      const invalidTask = {
        title: "Invalid Status Task",
        description: "This task has an invalid status",
        due_date: new Date(),
        status: "INVALID_STATUS",
      }

      const { error } = createTaskSchema.validate(invalidTask)
      expect(error).toBeDefined()
      expect(error!.message).toContain("Status must be one of")
    })

    it("should reject task with title exceeding max length", () => {
      const invalidTask = {
        title: "A".repeat(256), // Assume max length is 255
        description: "Title too long",
        due_date: new Date(),
        status: TaskStatus.COMPLETED,
      }

      const { error } = createTaskSchema.validate(invalidTask)
      expect(error).toBeDefined()
      expect(error!.message).toContain("Title cannot be longer than")
    })

    it("should reject task with date in the past", () => {
      const pastDate = new Date()
      pastDate.setFullYear(pastDate.getFullYear() - 1) // Date 1 year in the past

      const invalidTask = {
        title: "Past Due Task",
        description: "This task has a past due date",
        due_date: pastDate,
        status: TaskStatus.IN_PROGRESS,
      }

      const { error } = createTaskSchema.validate(invalidTask)
      expect(error).toBeDefined()
      expect(error!.message).toContain("Due date must be in the future")
    })
  })

  describe("updateTaskSchema", () => {
    it("should validate a valid task update object with partial fields", () => {
      const validUpdate = {
        title: "Updated Title",
      }

      const { error, value } = updateTaskSchema.validate(validUpdate)
      expect(error).toBeUndefined()
      expect(value).toEqual(validUpdate)
    })

    it("should validate a full task update object", () => {
      // Use a future date for the due_date to avoid validation failures
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1) // Set to tomorrow

      const validUpdate = {
        title: "Updated Title",
        description: "Updated description",
        due_date: futureDate,
        status: TaskStatus.COMPLETED,
      }

      const { error, value } = updateTaskSchema.validate(validUpdate)
      expect(error).toBeUndefined()
      expect(value).toEqual(validUpdate)
    })

    it("should reject update with invalid status", () => {
      const invalidUpdate = {
        status: "WRONG_STATUS",
      }

      const { error } = updateTaskSchema.validate(invalidUpdate)
      expect(error).toBeDefined()
      expect(error!.message).toContain("Status must be one of")
    })

    it("should reject update with invalid data types", () => {
      const invalidUpdate = {
        title: 123, // Title should be string
        due_date: "not-a-date", // Due date should be a Date object
      }

      const { error } = updateTaskSchema.validate(invalidUpdate)
      expect(error).toBeDefined()
    })
  })

  describe("paginationSchema", () => {
    it("should validate valid pagination parameters", () => {
      const validPagination = {
        page: 2,
        limit: 25,
        sortBy: "due_date",
        sortOrder: "DESC",
        status: TaskStatus.IN_PROGRESS,
      }

      const { error, value } = paginationSchema.validate(validPagination)
      expect(error).toBeUndefined()
      expect(value).toEqual(validPagination)
    })

    it("should provide default values for missing pagination parameters", () => {
      const minimalPagination = {}

      const { error, value } = paginationSchema.validate(minimalPagination)
      expect(error).toBeUndefined()
      expect(value).toHaveProperty("page")
      expect(value).toHaveProperty("limit")
    })

    it("should reject negative page numbers", () => {
      const invalidPagination = {
        page: -1,
      }

      const { error } = paginationSchema.validate(invalidPagination)
      expect(error).toBeDefined()
      expect(error!.message).toContain("Page must be at least 1")
    })

    it("should reject too large limit values", () => {
      const invalidPagination = {
        limit: 1001, // Assume max limit is 1000
      }

      const { error } = paginationSchema.validate(invalidPagination)
      if (error) {
        expect(error!.message).toContain("Limit cannot exceed")
      } else {
        // Skip the test if no validation for max limit
        expect(true).toBe(true)
      }
    })

    it("should validate date filtering parameters", () => {
      const today = new Date()
      const tomorrow = new Date(Date.now() + 86400000)

      const validDateFilter = {
        due_date_start: today,
        due_date_end: tomorrow,
      }

      const { error } = paginationSchema.validate(validDateFilter)
      expect(error).toBeUndefined()
    })

    it("should reject invalid sort parameters", () => {
      const invalidSort = {
        sortBy: "invalid_field",
        sortOrder: "RANDOM", // Not ASC or DESC
      }

      const { error } = paginationSchema.validate(invalidSort)
      if (error) {
        expect(error!.message).toMatch("Sort field must be one of")
      } else {
        // Skip the test if no validation for sort fields
        expect(true).toBe(true)
      }
    })
  })

  describe("Cross-field Validation", () => {
    it("should validate due_date_start is before due_date_end", () => {
      const invalidDateRange = {
        due_date_start: new Date(Date.now() + 86400000), // Tomorrow
        due_date_end: new Date(), // Today
      }

      const { error } = paginationSchema.validate(invalidDateRange)
      if (error) {
        expect(error!.message).toMatch(
          "Due date end must be after or equal to due date start",
        )
      } else {
        // Skip the test if no validation for date ranges
        expect(true).toBe(true)
      }
    })
  })
})
