/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('medias', function (table) {
    table.increments('id').unsigned().primary();
    table.text('uuid').notNullable();
    table.string('absolute_path', 512).notNullable().unique();
    table.string('file_name', 255).notNullable();
    table.string('media_type', 255).nullable();
    table.string('mime_type', 255).nullable();
    table.integer('file_size').unsigned().nullable();
    table.integer('created_by').unsigned().nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('created_by', 'fk_medias_created_by');
    table
      .foreign('created_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('medias');
};
