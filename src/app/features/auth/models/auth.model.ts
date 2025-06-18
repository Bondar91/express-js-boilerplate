export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ITokenPayload {
  publicId: string;
  name: string;
  surname: string;
  email: string;
}

export interface IAuthTokens extends ITokenPayload {
  refreshToken: string;
  accessToken: string;
}

export interface IRefreshTokenPayload {
  refreshToken: string;
}

export interface ILogoutPayload {
  publicId: string;
}

export interface IGenerateTokenPayload {
  token: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface ICreateForgotPasswordPayload {
  userId: number;
  token: string;
  expiresAt: Date;
}

export interface IResetPasswordRequestPayload {
  publicId: string;
  token: string;
  password: string;
}
