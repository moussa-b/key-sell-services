/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('users');
  if (!exists) {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.text('uuid'); // uuid TEXT
      table.string('username').unique().notNullable(); // username TEXT UNIQUE NOT NULL
      table.string('email').unique().notNullable(); // email TEXT UNIQUE NOT NULL
      table.string('password'); // password TEXT
      table.string('first_name').notNullable(); // first_name TEXT NOT NULL
      table.string('last_name').notNullable(); // last_name TEXT NOT NULL
      table.string('sex'); // sex TEXT
      table.string('preferred_language'); // preferred_language TEXT
      table.string('role').notNullable().defaultTo('user'); // role TEXT NOT NULL DEFAULT 'user'
      table.boolean('is_active').defaultTo(false); // is_active BOOLEAN DEFAULT 0
      table.text('activation_token'); // activation_token TEXT
      table.text('reset_password_token'); // reset_password_token TEXT
      table.datetime('reset_password_expires'); // reset_password_expires DATETIME
      table.integer('created_by').unsigned().nullable();
      table.datetime('created_at').defaultTo(knex.fn.now()); // created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      table.integer('updated_by').unsigned().nullable();
      table.datetime('updated_at'); // updated_at DATETIME

      // Indexes and Foreign Keys
      table.index(['created_by'], 'fk_users_created_by');
      table.index(['updated_by'], 'fk_users_updated_by');

      table
        .foreign('created_by', 'fk_users_created_by')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table
        .foreign('updated_by', 'fk_users_updated_by')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');
    });

    return knex.schema.raw(`
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
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
  await knex.raw(`DROP TRIGGER IF EXISTS update_users_updated_at;`);
  return knex.schema.dropTableIfExists('users');
};
