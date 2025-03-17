import { Request, Response, NextFunction } from "express"
import { NotFoundException } from "@/exceptions/http-exception"
import { logger } from "@/config/logger"

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`)
  next(
    new NotFoundException(`Route ${req.method} ${req.originalUrl} not found`),
  )
}
