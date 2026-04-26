const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../config/constants');

function paginate(query = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, parseInt(query.limit) || DEFAULT_PAGE_SIZE);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function paginatedResponse(rows, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    data: rows,
    pagination: {
      total: parseInt(total),
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

module.exports = { paginate, paginatedResponse };
