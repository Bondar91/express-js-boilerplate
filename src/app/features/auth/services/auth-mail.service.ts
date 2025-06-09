import { mailService } from '@/lib/mail/mail.service';

export class AuthMailService {
  private static instance: AuthMailService;
  private constructor() {}

  public async sendPasswordResetEmail(email: string, token: string, publicId: string) {
    await mailService.send({
      to: email,
      subject: 'Reset hasła',
      html: `<p>Twój link do resetu hasła: <a href="${process.env.ADMIN_PANEL_URL}/auth/reset-password?pid=${publicId}&token=${token}>Link</a></p>`,
    });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static getInstance(): AuthMailService {
    if (!AuthMailService.instance) {
      AuthMailService.instance = new AuthMailService();
    }
    return AuthMailService.instance;
  }
}

export const authMailService = AuthMailService.getInstance();
