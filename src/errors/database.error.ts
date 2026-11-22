import { AppError } from './app.error.js';
import { ErrorCode } from '../enums/errorCode.enum.js';
import { DATABASE_ERROR_MESSAGES, DATABASE_HTTP_STATUS } from '../constants/database.constants.js';

export function databaseConfigurationError(): AppError {
	return new AppError(ErrorCode.INTERNAL, DATABASE_HTTP_STATUS.internalServerError, DATABASE_ERROR_MESSAGES.missingConnectionString);
}
