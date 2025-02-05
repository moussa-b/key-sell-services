/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('clients');
  if (!exists) {
    return knex.schema.createTable('clients', (table) => {
      table.increments('id').primary(); // id INTEGER PRIMARY KEY AUTOINCREMENT
      table.text('uuid'); // uuid TEXT
      table.string('first_name').notNullable(); // first_name TEXT NOT NULL
      table.string('last_name').notNullable(); // last_name TEXT NOT NULL
      table.string('email').notNullable(); // email TEXT NOT NULL
      table.string('phone'); // phone TEXT
      table.string('sex'); // sex TEXT
      table.text('address'); // address TEXT
      table.integer('created_by').unsigned().nullable();
      table.datetime('created_at').defaultTo(knex.fn.now()); // created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      table.integer('updated_by').unsigned().nullable();
      table.datetime('updated_at'); // updated_at DATETIME

      // Indexes and Foreign Keys
      table.index(['created_by'], 'fk_clients_created_by');
      table.index(['updated_by'], 'fk_clients_updated_by');

      table
        .foreign('created_by', 'fk_clients_created_by')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table
        .foreign('updated_by', 'fk_clients_updated_by')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('clients');
};
