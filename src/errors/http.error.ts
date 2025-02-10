import { AppError } from './app.error';

export class HttpError extends AppError {
  public constructor(
    public status: number,
    message?: string,
  ) {
    super(message);
  }
}
