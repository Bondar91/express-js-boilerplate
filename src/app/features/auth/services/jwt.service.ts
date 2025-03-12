import jwt from 'jsonwebtoken';
import { jwtConfigFactory } from '@/config/jwt';
import type { ITokenPayload, IAuthTokens } from '../models/auth.model';

const jwtConfig = jwtConfigFactory(process.env);

export class JwtService {
  public static generateTokens(payload: ITokenPayload): IAuthTokens {
    const accessToken = jwt.sign(payload, jwtConfig.JWT_TOKEN_SECRET, {
      expiresIn: jwtConfig.JWT_TOKEN_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, jwtConfig.JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: jwtConfig.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      ...payload,
      accessToken,
      refreshToken,
    };
  }

  public static verifyAccessToken(token: string): ITokenPayload {
    return this.verifyToken(token, jwtConfig.JWT_TOKEN_SECRET);
  }

  public static verifyRefreshToken(token: string): ITokenPayload {
    return this.verifyToken(token, jwtConfig.JWT_REFRESH_TOKEN_SECRET);
  }

  private static verifyToken(token: string, secret: string): ITokenPayload {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== 'object' || decoded === null) {
      throw new Error('Invalid token payload');
    }
    return decoded as ITokenPayload;
  }
}
