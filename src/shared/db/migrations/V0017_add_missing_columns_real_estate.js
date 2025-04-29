/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('real_estates', function (table) {
    table
      .decimal('total_surface', 10, 2)
      .notNullable()
      .after('surface')
      .comment('');
    table
      .integer('year_of_construction')
      .notNullable()
      .after('total_surface')
      .comment('');
    table
      .string('orientation', 20)
      .nullable()
      .defaultTo(null)
      .after('price_currency')
      .comment('');
    table
      .string('assignment', 20)
      .nullable()
      .defaultTo(null)
      .after('orientation')
      .comment('');
  });
};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('real_estates', function (table) {
    table.dropColumn('total_surface');
    table.dropColumn('year_of_construction');
    table.dropColumn('orientation');
    table.dropColumn('assignment');
  });
};
