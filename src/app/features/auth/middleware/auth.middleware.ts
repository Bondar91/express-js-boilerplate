import { type Request, type Response, type NextFunction } from 'express';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { JwtService } from '../services/jwt.service';

export const authMiddleware = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies.accessToken;

      if (!accessToken) {
        throw new UnauthorizedError('No token provided');
      }

      const decodedToken = JwtService.verifyAccessToken(accessToken);

      req.user = decodedToken;

      next();
    } catch {
      next(new UnauthorizedError('Invalid token'));
    }
  };
};
