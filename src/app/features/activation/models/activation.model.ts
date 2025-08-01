export interface ICreateActivationTokenPayload {
  userId: number;
  token: string;
  expiresAt: Date;
  sentCount?: number;
}

export interface IResendActivationLinkPayload {
  email: string;
  organizationId: string;
}

export interface IAccountActivationRequestPayload {
  publicId: string;
  token: string;
  organizationId: string;
  name: string;
  surname: string;
  fee?: number;
}

export type TAccountActivationPayload = IAccountActivationRequestPayload & {
  activationTokenId: string;
};
