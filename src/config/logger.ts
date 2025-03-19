import pino from "pino"
import dotenv from "dotenv"

dotenv.config()

const NODE_ENV = process.env.NODE_ENV ?? "development"
const isProd = NODE_ENV !== "development"

const logger = isProd
  ? pino({
      level: "info",
      redact: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers.password",
      ],
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
    })
  : pino(
      {
        level: "debug",
        redact: [
          "req.headers.authorization",
          "req.headers.cookie",
          "req.headers.password",
        ],
        base: undefined,
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.transport({
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
            level: "debug",
          },
        ],
      }),
    )

export { logger }
