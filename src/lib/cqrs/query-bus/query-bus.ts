import type { IQueryHandler, IQuery } from './query-bus.types';
import { QueryNotSupportedError } from './query-bus.error';

export class QueryBus {
  private handlers: Map<string, IQueryHandler<IQuery<unknown>, unknown>> = new Map();

  public register<TQuery extends IQuery<unknown>, TResult>(handler: IQueryHandler<TQuery, TResult>) {
    this.handlers.set(handler.queryType, handler);
  }

  public async execute<TQuery extends IQuery<unknown>, TResult>(query: TQuery): Promise<TResult> {
    const handler = this.handlers.get(query.type) as IQueryHandler<TQuery, TResult>;

    if (!handler) {
      throw new QueryNotSupportedError(query.type);
    }

    return handler.execute(query);
  }
}
