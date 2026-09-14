import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  let rawMessage = err.message || 'An unexpected error occurred.';

  console.error(`❌ [API Error] ${req.method} ${req.originalUrl}:`, err.stack || rawMessage);

  // Sanitize technical database/network errors into warm, user-friendly messages
  let userFriendlyMessage = rawMessage;

  if (
    rawMessage.includes('buffering timed out') ||
    rawMessage.includes('MongoServerSelectionError') ||
    rawMessage.includes('connect ECONNREFUSED') ||
    rawMessage.includes('timed out') ||
    rawMessage.includes('ENOTFOUND')
  ) {
    userFriendlyMessage = 'Unable to connect to the server database right now. Please check your internet connection and try again in a moment.';
  } else if (rawMessage.includes('E11000 duplicate key')) {
    userFriendlyMessage = 'An account with this email address already exists. Please log in or use a different email.';
  } else if (rawMessage.includes('jwt expired') || rawMessage.includes('invalid signature') || rawMessage.includes('jwt malformed')) {
    userFriendlyMessage = 'Your session has expired. Please log in again to continue.';
  }

  res.status(statusCode).json({
    error: userFriendlyMessage,
    status: statusCode,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};
