import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define the format for production
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Choose format based on environment
const format = () => {
  return process.env.NODE_ENV === 'development' ? developmentFormat : productionFormat;
};

// Define which transports the logger must use
const transports = [
  new winston.transports.Console({
    format: format(),
  }),
  // Add file transport for production
  ...(process.env.NODE_ENV !== 'development' ? [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/all.log',
    }),
  ] : []),
];

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

// Export logger methods for easy use
export const logError = (message: string, error?: any) => {
  logger.error(message, error);
};

export const logWarn = (message: string, data?: any) => {
  logger.warn(message, data);
};

export const logInfo = (message: string, data?: any) => {
  logger.info(message, data);
};

export const logDebug = (message: string, data?: any) => {
  logger.debug(message, data);
};

export const logHttp = (message: string, data?: any) => {
  logger.http(message, data);
};

export default logger;