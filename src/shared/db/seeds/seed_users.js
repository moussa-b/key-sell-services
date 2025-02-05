exports.seed = function (knex) {
  // Deletes ALL existing entries in the table
  return knex.raw('DELETE FROM users').then(() => {
    // Inserts seed entries using raw SQL
    return knex.raw(`
                INSERT INTO users (uuid, username, email, password, first_name, last_name, role, is_active, created_at)
                VALUES ('fa2e07d2-8560-4788-ae12-3afc0037223a', 'admin', 'admin@example.com',
                        '$2b$10$ocTz8Nng0autUZcgXKdfC.yyIGSNoGfTirvlW7/uWU.BB.aMC4OV.', 'Alice', 'Smith', 'admin', 1,
                        CURRENT_TIMESTAMP),
                       ('86fb36b3-8593-431a-aac3-4dc3c22ce977', 'bob', 'bob@example.com',
                        '$2b$10$ocTz8Nng0autUZcgXKdfC.yyIGSNoGfTirvlW7/uWU.BB.aMC4OV.', 'Bob', 'Johnson', 'user', 1,
                        CURRENT_TIMESTAMP),
                       ('572c2d1e-1987-44f7-9e01-ac6112b487b0', 'charlie', 'charlie@example.com',
                        '$2b$10$ocTz8Nng0autUZcgXKdfC.yyIGSNoGfTirvlW7/uWU.BB.aMC4OV.', 'Charlie', 'Brown', 'user', 1,
                        CURRENT_TIMESTAMP),
                       ('a41741a3-426a-414f-aa4c-237f10837383', 'david', 'david@example.com',
                        '$2b$10$ocTz8Nng0autUZcgXKdfC.yyIGSNoGfTirvlW7/uWU.BB.aMC4OV.', 'David', 'Williams', 'user', 1,
                        CURRENT_TIMESTAMP),
                       ('d9febbfe-e63b-4da4-b870-567e016bb8bd', 'eve', 'eve@example.com',
                        '$2b$10$ocTz8Nng0autUZcgXKdfC.yyIGSNoGfTirvlW7/uWU.BB.aMC4OV.', 'Eve', 'Davis', 'user', 1,
                        CURRENT_TIMESTAMP);
            `);
  });
};
