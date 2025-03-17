import { Request, Response, NextFunction } from "express"
import { HttpException } from "@/exceptions/http-exception"
import { ValidationException } from "@/exceptions/validation.exception"
import { logger } from "@/config/logger"

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
      requestId: req.id,
    })

    res.status(error.status).json({
      status: error.status,
      message: error.message,
      errors: error.errors,
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId: req.id,
    })
    return
  }

  if (error instanceof HttpException) {
    logger.warn({
      msg: error.message,
      path: req.path,
      method: req.method,
      requestId: req.id,
    })

    res.status(error.status).json({
      status: error.status,
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId: req.id,
    })
    return
  }

  // Handling Sequelize errors
  if (
    error.name === "SequelizeValidationError" ||
    error.name === "SequelizeUniqueConstraintError"
  ) {
    logger.warn({
      msg: "Database validation error",
      path: req.path,
      method: req.method,
      error: error.message,
      requestId: req.id,
    })

    res.status(400).json({
      status: 400,
      message: "Validation error",
      errors: (error as any).errors.map((e: any) => ({
        field: e.path,
        message: e.message,
      })),
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId: req.id,
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
    requestId: req.id,
  })

  res.status(500).json({
    status: 500,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId: req.id,
  })
}
