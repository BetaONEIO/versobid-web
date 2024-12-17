export const buildSelectQuery = (fields: string[], relationships?: Record<string, string[]>) => {
  let query = fields.join(',');

  if (relationships) {
    Object.entries(relationships).forEach(([relation, relationFields]) => {
      query += `, ${relation} (${relationFields.join(',')})`;
    });
  }

  return query;
};

export const sanitizeQuery = (query: string): string => {
  return query.replace(/\s+/g, ' ').trim();
};