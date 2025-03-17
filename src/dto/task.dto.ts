import Joi from "joi"
import { TaskStatus } from "@/enums/task-status.enum"

export const createTaskSchema = Joi.object({
  title: Joi.string().required().max(100).trim().messages({
    "string.empty": "Title is required",
    "string.max": "Title cannot be longer than 100 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().required().trim().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  due_date: Joi.date().required().min("now").messages({
    "date.base": "Due date must be a valid date",
    "date.min": "Due date must be in the future",
    "any.required": "Due date is required",
  }),
  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .required()
    .messages({
      "any.only": `Status must be one of: ${Object.values(TaskStatus).join(", ")}`,
      "any.required": "Status is required",
    }),
}).options({ abortEarly: false, allowUnknown: false })

// Update Task DTO Validation Schema
export const updateTaskSchema = Joi.object({
  title: Joi.string().max(100).trim().messages({
    "string.max": "Title cannot be longer than 100 characters",
  }),
  description: Joi.string().trim(),
  due_date: Joi.date().min("now").messages({
    "date.base": "Due date must be a valid date",
    "date.min": "Due date must be in the future",
  }),
  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .messages({
      "any.only": `Status must be one of: ${Object.values(TaskStatus).join(", ")}`,
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required for update",
  })

// Get Tasks Query Validation Schema
export const getTasksQuerySchema = Joi.object({
  status: Joi.string().valid(...Object.values(TaskStatus)),
  due_date_start: Joi.date(),
  due_date_end: Joi.date().when("due_date_start", {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref("due_date_start")),
  }),
  search: Joi.string(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("title", "due_date", "status", "created_at")
    .default("created_at"),
  sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
})

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
  sortBy: Joi.string()
    .valid("title", "due_date", "status", "created_at")
    .default("due_date")
    .messages({
      "string.base": "Sort field must be a string",
      "any.only":
        "Sort field must be one of [title, due_date, status, created_at]",
    }),
  sortOrder: Joi.string().valid("ASC", "DESC").default("ASC").messages({
    "string.base": "Sort order must be a string",
    "any.only": "Sort order must be either ASC or DESC",
  }),
  status: Joi.string().valid(...Object.values(TaskStatus)),
  search: Joi.string().max(100),
  due_date_start: Joi.date().messages({
    "date.base": "Due date start must be a valid date",
    "any.required": "Due date start is required",
  }),
  due_date_end: Joi.date()
    .when("due_date_start", {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref("due_date_start")),
    })
    .messages({
      "date.base": "Due date end must be a valid date",
      "date.min": "Due date end must be after or equal to due date start",
      "any.required": "Due date end is required",
    }),
})
