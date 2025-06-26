export interface IRegistrationOrganizationPayload {
  name: string;
  email: string;
  password: string;
  slug?: string;
}

export interface IRegistrationOrganizationResponse {
  organizationId: string;
}
