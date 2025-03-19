import { type Request, type Response, type NextFunction } from "express"
import { type Schema } from "joi"
import { BadRequestException } from "../exceptions/http-exception"

/**
 * Middleware to validate request data against the schema
 * @param schema - Joi schema to validate against
 * @param source - Request property to validate (body, query, params)
 */
export const validateRequest = (
  schema: Schema,
  source: "body" | "query" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error !== undefined && error !== null) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", ")
      next(new BadRequestException(errorMessages))
      return
    }

    // Replace the request data with the validated data
    req[source] = value
    next()
  }
}
