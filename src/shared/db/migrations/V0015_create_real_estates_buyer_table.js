/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('real_estates_buyers', function (table) {
    table.integer('real_estate_id').unsigned().notNullable().defaultTo(0);
    table.integer('buyer_id').unsigned().notNullable().defaultTo(0);

    table.unique(['real_estate_id', 'buyer_id'], {
      indexName: 'unique_real_estate_id_buyer_id',
    });

    table
      .foreign('real_estate_id')
      .references('id')
      .inTable('real_estates')
      .onDelete('CASCADE');

    table
      .foreign('buyer_id')
      .references('id')
      .inTable('buyers')
      .onDelete('CASCADE');

    table.index('real_estate_id', 'fk_real_estates_id');
    table.index('buyer_id', 'fk_buyer_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('real_estates_buyers');
};
