'use strict';

/**
 * Moves the legacy `project.tech` JSON field into the `techStack` repeatable
 * component, before the schema sync drops the `tech` column.
 *
 * Strapi runs user migrations before syncing the schema, so the column still
 * exists here. Every row (draft and published) gets its own component rows, as
 * Strapi does. Rows that already have a techStack are left alone, and the
 * migration does nothing once the column is gone.
 */

const COMPONENT = 'project.tech-item';
const FIELD = 'techStack';

/** Same shapes the frontend used to accept: array, numeric-keyed object, "a, b" */
function techNames(value) {
  const items =
    typeof value === 'string'
      ? value.split(',')
      : Array.isArray(value)
        ? value
        : value && typeof value === 'object'
          ? Object.values(value)
          : [];
  return items
    .map((item) =>
      typeof item === 'string'
        ? item
        : item && typeof item === 'object' && 'name' in item
          ? String(item.name ?? '')
          : ''
    )
    .map((name) => name.trim())
    .filter(Boolean);
}

module.exports = {
  async up(knex) {
    if (!(await knex.schema.hasColumn('projects', 'tech'))) return;

    const rows = await knex('projects')
      .select('id', 'tech')
      .whereNotNull('tech')
      .whereNotExists(
        knex('projects_cmps')
          .select(knex.raw('1'))
          .whereRaw('projects_cmps.entity_id = projects.id')
          .andWhere({ field: FIELD, component_type: COMPONENT })
      );

    for (const row of rows) {
      const raw = typeof row.tech === 'string' ? safeParse(row.tech) : row.tech;
      const names = techNames(raw);

      for (const [index, name] of names.entries()) {
        const [{ id }] = await knex('components_project_tech_items').insert({ name }).returning('id');
        await knex('projects_cmps').insert({
          entity_id: row.id,
          cmp_id: id,
          component_type: COMPONENT,
          field: FIELD,
          order: index + 1,
        });
      }
    }
  },
};

/** jsonb comes back parsed on Postgres; other drivers may return text */
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
