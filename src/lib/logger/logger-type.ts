export type TLogMethod = (level: string, msg: string) => ILogger;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TLeveledLogMethod = (msg: string, error?: any) => ILogger;

export interface ILogger {
  log: TLogMethod;
  error: TLeveledLogMethod;
  warn: TLeveledLogMethod;
  info: TLeveledLogMethod;
  verbose: TLeveledLogMethod;
  debug: TLeveledLogMethod;
}
