/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('buyers');
  if (!exists) {
    await knex.schema.createTable('buyers', (table) => {
      table.increments('id').primary();
      table.text('uuid');
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('email').notNullable();
      table.string('phone');
      table.string('sex');
      table.string('preferred_language');
      table.decimal('budget', 12, 2).unsigned().defaultTo(0).nullable();
      table.string('budget_currency').nullable();
      table.integer('address_id').unsigned().nullable();
      table.integer('created_by').unsigned().nullable();
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.integer('updated_by').unsigned().nullable();
      table.datetime('updated_at');
      table.integer('user_id').unsigned().nullable();

      // Indexes and Foreign Keys
      table.index(['created_by'], 'fk_buyers_created_by');
      table.index(['updated_by'], 'fk_buyers_updated_by');
      table.index(['user_id'], 'fk_buyers_user_id');
      table.index(['address_id'], 'fk_buyers_address_id');

      table
        .foreign('created_by', 'fk_buyers_created_by')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table
        .foreign('updated_by', 'fk_buyers_updated_by')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table
        .foreign('user_id', 'fk_buyers_user_id')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table
        .foreign('address_id', 'fk_buyers_address_id')
        .references('id')
        .inTable('addresses')
        .onDelete('SET NULL');
    });

    return knex.schema.raw(`
    CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers
    FOR EACH ROW
    SET NEW.updated_at = CURRENT_TIMESTAMP;
  `);
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw(`DROP TRIGGER IF EXISTS update_buyers_updated_at;`);
  return knex.schema.dropTableIfExists('buyers');
};
