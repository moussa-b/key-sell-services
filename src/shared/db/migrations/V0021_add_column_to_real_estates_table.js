/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('real_estates', function (table) {
    table.integer('floor_number').unsigned().nullable().after('terrace_count');
  });
};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('real_estates', function (table) {
    table.dropColumn('floor_number');
  });
};
