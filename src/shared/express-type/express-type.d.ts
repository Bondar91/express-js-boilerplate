import type { ITokenPayload } from '@/app/features/auth/models/auth.model';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Request {
      user?: ITokenPayload;
    }
  }
}
