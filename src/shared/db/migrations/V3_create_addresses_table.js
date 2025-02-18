/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('addresses', (table) => {
    table.increments('id').primary();
    table.string('street', 255).nullable();
    table.string('complement', 255).nullable();
    table.string('zip_code', 20).notNullable();
    table.string('city', 100).notNullable();
    table.string('country_code', 10).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('addresses');
};
