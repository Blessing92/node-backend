import { config } from "dotenv"
import path from "path"

config({ path: path.resolve(__dirname, "../.env.test") })

jest.setTimeout(30000)

jest.mock("@/config/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}))
