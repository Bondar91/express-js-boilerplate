import type { NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<any>;
