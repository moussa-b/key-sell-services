/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('configuration', function (table) {
    table.string('category', 90).notNullable().defaultTo('');
    table.string('property_name', 90).notNullable().defaultTo('');
    table.text('property_value').nullable();
    table.string('property_description', 256).nullable();
    table.primary(['category', 'property_name']);
  });
  return knex('configuration').insert([
    {
      category: 'standard',
      property_name: 'global_user_access',
      property_value: JSON.stringify({
        canEditBuyers: true,
        canEditCalendarEvents: false,
        canEditRealEstates: true,
        canEditSellers: true,
        canEditUsers: true,
        canEditUsersAccess: true,
        canSendEmail: true,
        canShowBuyers: true,
        canShowCalendarEvents: false,
        canShowRealEstates: true,
        canShowSellers: true,
        canShowUsers: true,
        canShowUsersAccess: true,
      }),
    },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('configuration');
};
