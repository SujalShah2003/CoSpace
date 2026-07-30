export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export const parsePagination = (
  pageValue: unknown,
  pageSizeValue: unknown,
  defaultPageSize = 10,
) => {
  const parsedPage = Number(pageValue);
  const parsedPageSize = Number(pageSizeValue);
  return {
    page:
      Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    pageSize:
      Number.isInteger(parsedPageSize) && parsedPageSize > 0
        ? Math.min(parsedPageSize, 100)
        : defaultPageSize,
  };
};

export const paginate = <T>(
  records: T[],
  page: number,
  pageSize: number,
): { records: T[]; pagination: PaginationMeta } => {
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    records: records.slice(start, start + pageSize),
    pagination: {
      page: safePage,
      pageSize,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
};

export const createPagination = (
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
