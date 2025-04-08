import { StatusCodes } from 'http-status-codes';
import { HttpError } from './http.error';

export class ConflictError extends HttpError {
  public constructor(message: string) {
    super(StatusCodes.CONFLICT, message);
  }
}
