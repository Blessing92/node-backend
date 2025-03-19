import { Router } from "express"
import TaskController from "../controllers/task.controller"
import { validateRequest } from "../middleware/validation.middleware"
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
} from "../dto/task.dto"

const router = Router()

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Public
 */
router.post("/", validateRequest(createTaskSchema), TaskController.createTask)

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filtering, pagination, and sorting
 * @access  Public
 */
router.get(
  "/",
  validateRequest(getTasksQuerySchema, "query"),
  TaskController.getTasks,
)

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a specific task by ID
 * @access  Public
 */
router.get("/:id", TaskController.getTaskById)

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update an existing task
 * @access  Public
 */
router.put("/:id", validateRequest(updateTaskSchema), TaskController.updateTask)

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Public
 */
router.delete("/:id", TaskController.deleteTask)

export default router
