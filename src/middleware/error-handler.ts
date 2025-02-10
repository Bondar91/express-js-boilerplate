import type { Request, Response, ErrorRequestHandler, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../errors/app.error';
import { HttpError } from '../errors/http.error';
import { BadRequestError } from '../errors/bad-request.error';
import { type CelebrateError, isCelebrateError } from 'celebrate';

export enum ERROR_CODE {
  VALIDATION_PARSE = 'error.validation.parse',
  BAD_REQUEST = 'error.bad_request',
  HTTP = 'error.http',
  APP = 'error.app',
  UNKNOWN = 'error.unknown',
}

interface IValidationErrorItem {
  path: string;
  message: string;
}

export const celebrateToValidationError = (error: CelebrateError): IValidationErrorItem[] => {
  const validationErrors: IValidationErrorItem[] = [];

  error.details.forEach(detail => {
    detail.details.forEach(validationError => {
      validationErrors.push({
        path: validationError.path.join('.'),
        message: validationError.message,
      });
    });
  });

  return validationErrors;
};

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (isCelebrateError(err)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: { code: ERROR_CODE.BAD_REQUEST, message: err.message, errors: celebrateToValidationError(err) },
    });
    return;
  }

  switch (true) {
    case err instanceof BadRequestError:
      res.status(err.status).json({
        error: { code: ERROR_CODE.BAD_REQUEST, message: err.message },
      });
      return;

    case err instanceof HttpError:
      res.status(err.status).json({
        error: { code: ERROR_CODE.HTTP, message: err.message },
      });
      return;

    case err instanceof AppError:
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: { code: ERROR_CODE.APP, message: err.message },
      });
      return;

    default:
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: { code: ERROR_CODE.UNKNOWN, message: err.message },
      });
      return;
  }
};
