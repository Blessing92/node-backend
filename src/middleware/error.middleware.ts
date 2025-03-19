import { type NextFunction, type Request, type Response } from "express"
import { HttpException } from "@/exceptions/http-exception"
import { ValidationException } from "@/exceptions/validation.exception"
import { logger } from "@/config/logger"
import { ValidationError } from "sequelize"

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (error instanceof ValidationException) {
    logger.warn({
      msg: "Validation error",
      path: req.path,
      method: req.method,
      errors: error.errors,
    })

    res.status(error.status).json({
      status: error.status,
      success: false,
      message: error.message,
      errors: error.errors,
      timestamp: new Date().toISOString(),
      path: req.path,
    })
    return
  }

  if (error instanceof HttpException) {
    logger.warn({
      msg: error.message,
      path: req.path,
      method: req.method,
    })

    res.status(error.status).json({
      status: error.status,
      success: false,
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.path,
    })
    return
  }

  // Handling Sequelize errors
  if (error instanceof ValidationError) {
    logger.warn({
      msg: "Database validation error",
      path: req.path,
      method: req.method,
      error: error.message,
    })

    res.status(400).json({
      status: 400,
      success: false,
      message: "Validation error",
      errors: error.errors.map((e) => ({
        field: e.path ?? "unknown_field",
        message: e.message,
      })),
      timestamp: new Date().toISOString(),
      path: req.path,
    })
    return
  }

  // Default error handling
  logger.error({
    msg: "Internal server error",
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  })

  res.status(500).json({
    status: 500,
    success: false,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
    path: req.path,
  })
}
