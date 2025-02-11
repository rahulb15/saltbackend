// utils/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for logging
const customFormat = printf(({ level, message, timestamp, service, ...metadata }) => {
  let metaStr = Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : '';
  return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
});

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Configure transports
const getTransports = (service: string) => {
  const transports: winston.transport[] = [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        customFormat
      )
    }),
    
    // File transport for all logs
    new DailyRotateFile({
      filename: path.join(logsDir, `${service}-%DATE%.log`),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info'
    }),

    // Separate file for errors
    new DailyRotateFile({
      filename: path.join(logsDir, `${service}-error-%DATE%.log`),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error'
    })
  ];

  // Add additional transports for development
  if (process.env.NODE_ENV !== 'production') {
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, `${service}-debug.log`),
        level: 'debug'
      })
    );
  }

  return transports;
};

// Create logger
export const createLogger = (service: string) => {
  return winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
      timestamp(),
      errors({ stack: true }),
      customFormat
    ),
    defaultMeta: { service },
    transports: getTransports(service),
    // Exit on error
    exitOnError: false
  });
};

// Example usage:
// const logger = createLogger('BookingService');
// logger.info('Booking created', { bookingId: '123', userId: '456' });
// logger.error('Failed to create booking', { error: error, bookingData: data });
// logger.debug('Processing booking request', { requestData: data });