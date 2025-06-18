import { StatusCodes } from 'http-status-codes';
import { HttpError } from './http.error';

export class RateLimitError extends HttpError {
  public constructor(message: string) {
    super(StatusCodes.TOO_MANY_REQUESTS, message);
  }
}
