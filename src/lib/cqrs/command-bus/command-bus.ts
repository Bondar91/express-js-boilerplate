import { CommandNotSupportedError } from './command-bus.error';
import type { ICommand, ICommandHandler } from './command-bus.types';

export class CommandBus {
  private handlers: Map<string, ICommandHandler<ICommand<unknown>, unknown>> = new Map();

  public register<TCommand extends ICommand<unknown>, TResult>(handler: ICommandHandler<TCommand, TResult>) {
    this.handlers.set(handler.commandType, handler);
  }

  public async execute<TCommand extends ICommand<unknown>, TResult>(command: TCommand): Promise<TResult> {
    const handler = this.handlers.get(command.type) as ICommandHandler<TCommand, TResult>;

    if (!handler) {
      throw new CommandNotSupportedError(command.type);
    }

    return handler.execute(command);
  }
}
