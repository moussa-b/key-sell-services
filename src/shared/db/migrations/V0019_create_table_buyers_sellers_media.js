/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('buyers_media', (table) => {
    table.integer('buyer_id').unsigned().notNullable();
    table.integer('media_id').unsigned().notNullable();

    table.index('buyer_id', 'fk_buyers_media_buyer_id');
    table.index('media_id', 'fk_buyers_media_media_id');

    table
      .foreign('buyer_id', 'buyers_media_buyer_id_foreign')
      .references('id')
      .inTable('buyers')
      .onDelete('CASCADE');

    table
      .foreign('media_id', 'buyers_media_media_id_foreign')
      .references('id')
      .inTable('medias')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('sellers_media', (table) => {
    table.integer('seller_id').unsigned().notNullable();
    table.integer('media_id').unsigned().notNullable();

    table.index('seller_id', 'fk_sellers_media_seller_id');
    table.index('media_id', 'fk_sellers_media_media_id');

    table
      .foreign('seller_id', 'sellers_media_seller_id_foreign')
      .references('id')
      .inTable('sellers')
      .onDelete('CASCADE');

    table
      .foreign('media_id', 'sellers_media_media_id_foreign')
      .references('id')
      .inTable('medias')
      .onDelete('CASCADE');
  });
};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('sellers_media');
  await knex.schema.dropTableIfExists('buyers_media');
};
