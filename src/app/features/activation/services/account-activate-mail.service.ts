import { mailService } from '@/lib/mail/mail.service';

export class AccountActivateMailService {
  private static instance: AccountActivateMailService;
  private constructor() {}

  public async sendAccountActivateEmail(email: string, token: string, publicId: string, organizationId: string) {
    await mailService.send({
      to: email,
      subject: 'Aktywacja konta',
      html: `<p>Twój link do aktywacji konta: <a href="${process.env.ADMIN_PANEL_URL}/auth/account-activate?pid=${publicId}&token=${token}&oid=${organizationId}>Link</a></p>`,
    });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static getInstance(): AccountActivateMailService {
    if (!AccountActivateMailService.instance) {
      AccountActivateMailService.instance = new AccountActivateMailService();
    }
    return AccountActivateMailService.instance;
  }
}

export const accountActivateMailService = AccountActivateMailService.getInstance();
