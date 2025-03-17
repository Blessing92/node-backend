import 'dotenv/config';
import App from './app';
import {logger} from "@/config/logger";
// import { metrics } from './utils/metrics.util';

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', { error });
  // metrics.increment('error.uncaught');
  process.exit(1);
});

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled rejection', { reason });
  // metrics.increment('error.unhandled_rejection');
  process.exit(1);
});

const app = new App();

app.listen().catch((error) => {
  logger.error('Failed to start application', { error });
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received kill signal, shutting down gracefully');
  setTimeout(() => {
    logger.info('Shutting down now');
    process.exit(0);
  }, 500);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
