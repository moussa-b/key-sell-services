/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('real_estates_media', function (table) {
    table.integer('real_estate_id').unsigned().notNullable();
    table.integer('media_id').unsigned().notNullable();

    table
      .foreign('real_estate_id')
      .references('id')
      .inTable('real_estates')
      .onDelete('CASCADE');

    table
      .foreign('media_id')
      .references('id')
      .inTable('medias')
      .onDelete('CASCADE');

    table.index('real_estate_id', 'fk_real_estates_media_real_estate_id');
    table.index('media_id', 'fk_real_estates_media_media_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('real_estates_media');
};
