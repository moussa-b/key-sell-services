/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('preferred_language').after('sex'); // preferred_language TEXT
  });

  return knex.schema.alterTable('clients', (table) => {
    table.string('preferred_language').after('sex'); // Ajout de preferred_language après sex
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('preferred_language');
  });

  return knex.schema.alterTable('clients', (table) => {
    table.dropColumn('preferred_language');
  });
};
