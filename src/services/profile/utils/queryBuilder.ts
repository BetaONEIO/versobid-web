export const buildSelectQuery = (fields: string[], relationships?: Record<string, string[]>) => {
  let query = fields.join(',');

  if (relationships) {
    Object.entries(relationships).forEach(([relation, relationFields]) => {
      query += `, ${relation} (${relationFields.join(',')})`;
    });
  }

  return sanitizeQuery(query);
};

export const sanitizeQuery = (query: string): string => {
  return query.replace(/\s+/g, ' ').trim();
};

export const buildWhereClause = (conditions: Record<string, any>): string => {
  return Object.entries(conditions)
    .map(([key, value]) => `${key}.eq.${value}`)
    .join(',');
};