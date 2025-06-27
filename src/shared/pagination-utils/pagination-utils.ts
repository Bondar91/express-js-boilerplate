export enum SORT_ORDER {
  ASC = 'asc',
  DESC = 'desc',
}

export interface IPaginationResult<T> {
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filter?: Record<string, unknown>;
    sort?: Record<string, SORT_ORDER>;
    search?: string;
  };
  data: T[];
}

export interface IPaginationParamsDto {
  page?: number;
  limit?: number;
  sort?: { [key: string]: SORT_ORDER };
  filter?: { [key: string]: string | string[] | boolean | number };
  search?: string;
  organizationId?: string;
}

export interface IPaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
  searchFields?: string[];
}

export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function normalizePage(page: number): number {
  return Math.max(page, 1);
}

export function normalizeLimit(limit: number, options: IPaginationOptions): number {
  const { defaultLimit = 10, maxLimit = 100 } = options;
  return Math.min(Math.max(limit || defaultLimit, 1), maxLimit);
}

export function createWhereInput(
  filter: IPaginationParamsDto['filter'],
  search?: string,
  searchFields: string[] = [],
): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        where[key] = { in: value };
      } else {
        where[key] = value;
      }
    });
  }

  if (search && searchFields.length > 0) {
    where.OR = searchFields.map(field => ({
      [field]: { contains: search, mode: 'insensitive' },
    }));
  }

  return where;
}

export function createOrderBy(sort?: IPaginationParamsDto['sort']): Record<string, SORT_ORDER> | undefined {
  if (!sort) {
    return undefined;
  }

  const [field, order] = Object.entries(sort)[0];
  return { [field]: order };
}

export function makePaginationResult<T>(
  data: T[],
  total: number,
  params: IPaginationParamsDto,
  options: IPaginationOptions,
): IPaginationResult<T> {
  const page = normalizePage(params.page || 1);
  const limit = normalizeLimit(params.limit || options.defaultLimit || 10, options);

  return {
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filter: params.filter,
      sort: params.sort,
      search: params.search,
    },
    data,
  };
}
