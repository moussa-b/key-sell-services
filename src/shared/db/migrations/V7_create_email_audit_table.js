/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('emails', function (table) {
    table.string('message_id', 256).primary();
    table.text('email_to', 'mediumtext').notNullable();
    table.string('email_from', 256).collate('utf8mb4_0900_ai_ci').nullable();
    table.text('subject').collate('utf8mb4_0900_ai_ci').nullable();
    table.text('content').collate('utf8mb4_0900_ai_ci').nullable();

    table.integer('sent_by_user_id').unsigned().nullable();
    table.integer('user_id').unsigned().nullable();
    table.integer('seller_id').unsigned().nullable();
    table.integer('buyer_id').unsigned().nullable();

    table.dateTime('sent_at').nullable();

    // Indexes
    table.index('sent_by_user_id', 'fk_emails_sent_by_user_id');
    table.index('user_id', 'fk_emails_user_id');
    table.index('buyer_id', 'fk_emails_buyer_id');
    table.index('seller_id', 'fk_emails_seller_id');

    // Foreign keys
    table
      .foreign('sent_by_user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .foreign('seller_id')
      .references('id')
      .inTable('sellers')
      .onDelete('SET NULL');
    table
      .foreign('buyer_id')
      .references('id')
      .inTable('buyers')
      .onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('emails');
};
