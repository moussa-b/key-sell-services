/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('real_estates');
  if (!exists) {
    await knex.schema.createTable('real_estates', (table) => {
      table.increments('id').primary();
      table.string('type', 10).notNullable();
      table.boolean('terraced').notNullable().defaultTo(false);
      table.decimal('surface', 10, 2).notNullable();
      table.integer('room_count').notNullable();
      table.integer('shower_count').nullable();
      table.integer('terrace_count').nullable();
      table.boolean('has_garden').defaultTo(false);
      table.decimal('garden_surface', 10, 2).nullable();
      table.boolean('is_secured').defaultTo(false);
      table.text('security_detail').nullable();
      table.integer('facade_count').nullable();
      table.text('location').nullable();
      table.decimal('price', 15, 2).notNullable();
      table.string('price_currency', 10).notNullable();
      table.text('remark').nullable();
      table.integer('address_id').unsigned().nullable();
      table.integer('created_by').unsigned().nullable();
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.integer('updated_by').unsigned().nullable();
      table.datetime('updated_at');

      table.index(['created_by'], 'fk_real_estate_created_by');
      table.index(['updated_by'], 'fk_real_estate_updated_by');
      table.index(['address_id'], 'fk_real_estate_address_id');

      table
        .foreign('created_by', 'fk_real_estate_created_by')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table
        .foreign('updated_by', 'fk_real_estate_updated_by')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table
        .foreign('address_id', 'fk_real_estate_address_id')
        .references('id')
        .inTable('addresses')
        .onDelete('SET NULL');
    });
  }

  return knex.schema.raw(`
    CREATE TRIGGER update_real_estate_updated_at BEFORE UPDATE ON real_estates
    FOR EACH ROW
    SET NEW.updated_at = CURRENT_TIMESTAMP;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('real_estates');
};
