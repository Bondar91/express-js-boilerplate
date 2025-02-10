export interface IQuery<T> {
  type: string;
  params: T;
}

export interface IQueryHandler<TQuery extends IQuery<unknown>, TResult> {
  queryType: string;
  execute(query: TQuery): Promise<TResult>;
}
