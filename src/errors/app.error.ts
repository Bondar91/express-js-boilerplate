export class AppError extends Error {
  public constructor(message?: string) {
    super(message);

    Error.captureStackTrace(this, AppError.captureStackTrace);
  }
}
