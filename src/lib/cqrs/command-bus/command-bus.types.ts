export interface ICommand<T> {
  type: string;
  payload: T;
}

export interface ICommandHandler<TCommand extends ICommand<unknown>, TResult> {
  commandType: string;
  execute(command: TCommand): Promise<TResult>;
}
