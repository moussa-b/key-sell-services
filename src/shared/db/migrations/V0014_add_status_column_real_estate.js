/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .alterTable('real_estates', function (table) {
      table
        .string('status', 128)
        .nullable()
        .defaultTo('FOR_SALE')
        .after('address_id');
      table.string('status_remark', 512).nullable().after('status');
    })
    .then(() => {
      return knex('real_estates').update({ status: 'FOR_SALE' });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.alterTable('real_estates', function (table) {
    table.dropColumn('status');
    table.dropColumn('status_remark');
  });
};
