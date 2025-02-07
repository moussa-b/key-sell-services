/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('users_access');
  if (!exists) {
    return knex.schema.createTable('users_access', (table) => {
      table.integer('user_id').unsigned().notNullable();
      table.string('access');
      table.boolean('active').defaultTo(false);
      table.unique(['user_id', 'access']);
      table
        .foreign('user_id', 'fk_users_acces_user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('users_access');
};
