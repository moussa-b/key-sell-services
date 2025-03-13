/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const bcrypt = require('bcrypt');

exports.up = function (knex) {
  if (process.env.NODE_ENV === 'development') {
    console.log('ADMIN_USER_PASSWORD = ', process.env.ADMIN_USER_PASSWORD);
  }
  return bcrypt
    .hash(process.env.ADMIN_USER_PASSWORD, 10)
    .then((cryptedPassword) => {
      return knex('users').insert({
        uuid: 'fa2e07d2-8560-4788-ae12-3afc0037223a',
        username: 'admin',
        email: 'admin@example.com',
        password: cryptedPassword,
        first_name: 'Administrator',
        last_name: 'System',
        sex: 'M',
        role: 'ADMIN',
        is_active: true,
        created_at: knex.fn.now(),
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex('users')
    .where({ uuid: 'fa2e07d2-8560-4788-ae12-3afc0037223a' })
    .del();
};
