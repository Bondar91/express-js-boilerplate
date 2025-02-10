export class QueryNotSupportedError extends Error {
  public constructor(queryType: string) {
    super(`Query: ${queryType} is not supported.`);
    this.name = 'QueryNotSupportedError';
  }
}
