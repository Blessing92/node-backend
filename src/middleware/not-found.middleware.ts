import { Request, Response, NextFunction } from 'express';
import { NotFoundException } from "@/exceptions/http-exception";
import {logger} from "@/config/logger";
// import { metrics } from '../utils/metrics.util';

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  // metrics.increment('request.not_found');
  next(new NotFoundException(`Route ${req.method} ${req.originalUrl} not found`));
};
