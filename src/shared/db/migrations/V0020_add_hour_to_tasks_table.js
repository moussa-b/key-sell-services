/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('tasks', function (table) {
    table.string('hour', 20).notNullable().defaultTo('').after('date');
  });
};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('tasks', function (table) {
    table.dropColumn('hour');
  });
};
