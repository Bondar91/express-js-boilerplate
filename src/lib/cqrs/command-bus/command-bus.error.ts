export class CommandNotSupportedError extends Error {
  public constructor(commandType: string) {
    super(`Command: ${commandType} is not supported.`);
    this.name = 'CommandNotSupportedError';
  }
}
