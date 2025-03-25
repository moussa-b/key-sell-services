/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable('real_estates', function (table) {
      table.date('sale_date').nullable().after('status_remark');
      table.decimal('final_selling_price', 15, 2).nullable().after('sale_date');
    })
    .then(() => {
      return knex.raw(`UPDATE real_estates SET final_selling_price = price`);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('real_estates', function (table) {
    table.dropColumn('sale_date');
    table.dropColumn('final_selling_price');
  });
};
