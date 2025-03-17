import { Request, Response, NextFunction } from "express"
import { v4 as uuidv4 } from "uuid"
import { logger } from "@/config/logger"

declare global {
  namespace Express {
    interface Request {
      id: string
    }
  }
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  req.id = uuidv4()

  const start = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - start
    const logLevel =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"

    logger[logLevel]({
      msg: "HTTP request",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      contentLength: res.get("Content-Length"),
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      duration: `${duration}ms`,
      requestId: req.id,
    })
  })

  next()
}
