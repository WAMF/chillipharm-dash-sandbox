const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

export function getPaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

export function buildPaginationResponse(page, limit, total, baseUrl, queryParams = {}) {
  const totalPages = Math.ceil(total / limit);
  
  const buildUrl = (p) => {
    const params = new URLSearchParams({ ...queryParams, page: p, limit });
    return `${baseUrl}?${params.toString()}`;
  };
  
  return {
    meta: {
      page,
      limit,
      total,
      totalPages
    },
    links: {
      self: buildUrl(page),
      first: buildUrl(1),
      last: totalPages > 0 ? buildUrl(totalPages) : null,
      prev: page > 1 ? buildUrl(page - 1) : null,
      next: page < totalPages ? buildUrl(page + 1) : null
    }
  };
}

export function getSortParams(query, allowedFields, defaultSort = 'id', defaultOrder = 'desc') {
  const sort = allowedFields.includes(query.sort) ? query.sort : defaultSort;
  const order = ['asc', 'desc'].includes(query.order?.toLowerCase()) ? query.order.toLowerCase() : defaultOrder;
  
  return { sort, order };
}
