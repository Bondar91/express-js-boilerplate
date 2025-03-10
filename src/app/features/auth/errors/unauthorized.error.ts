import { StatusCodes } from 'http-status-codes';
import { HttpError } from '../../../../errors/http.error';

export class UnauthorizedError extends HttpError {
  public constructor(message = 'Unauthorized') {
    super(StatusCodes.UNAUTHORIZED, message);
  }
}
