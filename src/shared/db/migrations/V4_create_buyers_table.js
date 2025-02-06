/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('buyers');
  if (!exists) {
    await knex.schema.createTable('buyers', (table) => {
      table.increments('id').primary(); // id INTEGER PRIMARY KEY AUTOINCREMENT
      table.text('uuid'); // uuid TEXT
      table.string('first_name').notNullable(); // first_name TEXT NOT NULL
      table.string('last_name').notNullable(); // last_name TEXT NOT NULL
      table.string('email').notNullable(); // email TEXT NOT NULL
      table.string('phone'); // phone TEXT
      table.string('sex'); // sex TEXT
      table.string('preferred_language'); // preferred_language TEXT
      table.text('address'); // address TEXT
      table.integer('created_by').unsigned().nullable();
      table.datetime('created_at').defaultTo(knex.fn.now()); // created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      table.integer('updated_by').unsigned().nullable();
      table.datetime('updated_at'); // updated_at DATETIME
      table.integer('user_id').unsigned().nullable();

      // Indexes and Foreign Keys
      table.index(['created_by'], 'fk_buyers_created_by');
      table.index(['updated_by'], 'fk_buyers_updated_by');

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
