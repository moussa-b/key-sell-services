/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('real_estates_sellers', function (table) {
    table.integer('real_estate_id').unsigned().notNullable().defaultTo(0);
    table.integer('seller_id').unsigned().notNullable().defaultTo(0);

    table.unique(['real_estate_id', 'seller_id'], {
      indexName: 'unique_real_estate_id_seller_id',
    });

    table
      .foreign('real_estate_id')
      .references('id')
      .inTable('real_estates')
      .onDelete('CASCADE');

    table
      .foreign('seller_id')
      .references('id')
      .inTable('sellers')
      .onDelete('CASCADE');

    table.index('real_estate_id', 'fk_real_estates_id');
    table.index('seller_id', 'fk_seller_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('real_estates_sellers');
};
