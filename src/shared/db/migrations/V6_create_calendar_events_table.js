/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('calendar_events', function (table) {
    table.increments('id').primary();
    table.string('uuid', 40).notNullable().unique();
    table.string('title', 512).notNullable();
    table.text('description').nullable();
    table.integer('user_id').unsigned().nullable();
    table.dateTime('start_date').nullable();
    table.dateTime('end_date').nullable();
    table.integer('status').unsigned().nullable();
    table.integer('reminder').unsigned().nullable();
    table.dateTime('reminder_sent_at').nullable();
    table.integer('recurring').notNullable().defaultTo(0);
    table.integer('recurring_event_id').unsigned().nullable();
    table.integer('created_by').unsigned().nullable();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.integer('updated_by').unsigned().nullable();
    table.dateTime('updated_at').nullable();

    // Indexes and Foreign Keys
    table.index(['user_id'], 'fk_calendar_events_users');
    table.index(['created_by'], 'fk_calendar_events_created_by');
    table.index(['updated_by'], 'fk_calendar_events_updated_by');

    table
      .foreign('user_id', 'fk_calendar_events_users')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table
      .foreign('created_by', 'fk_calendar_events_created_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table
      .foreign('updated_by', 'fk_calendar_events_updated_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('calendar_events');
};
