import { ErrorCode } from '../enums/errorCode.enum.js';

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = new.target.name;
  }
}
