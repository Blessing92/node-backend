import pino from "pino"
import dotenv from "dotenv"

dotenv.config()

const NODE_ENV = process.env.NODE_ENV ?? "development"

const transport = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      options: { colorize: true },
      level: "info",
    },
    {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
      level: NODE_ENV === "development" ? "debug" : "info",
    },
  ],
})

export const logger = pino(
  {
    level: NODE_ENV === "development" ? "debug" : "info",
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers.password",
    ],
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport as pino.DestinationStream,
)
