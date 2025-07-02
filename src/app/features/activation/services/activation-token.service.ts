import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { findActivationTokenUniqueByToken } from '../repository/activation.repository';
import type { ActivationToken } from '@prisma/client';

export class ActivationTokenService {
  public async generateUniqueToken() {
    let token: string;
    let hashedToken: string;
    let existingToken: ActivationToken | null;

    do {
      token = randomBytes(32).toString('hex');
      hashedToken = await bcrypt.hash(token, 10);
      existingToken = await findActivationTokenUniqueByToken(hashedToken);
    } while (existingToken);

    return { token, hashedToken };
  }
}

export const activationTokenService = new ActivationTokenService();
