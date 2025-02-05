exports.seed = function (knex) {
  return knex
    .raw('DELETE FROM clients')
    .then(() => {
      // Reset the auto-incrementing ID (optional for SQLite)
      return knex.raw('DELETE FROM sqlite_sequence WHERE name="clients"');
    })
    .then(() => {
      // Inserts seed entries using raw SQL
      return knex.raw(`
                INSERT INTO clients (uuid, name, phone, address, email) VALUES
                  ('04c31db6-d6f0-4d82-8e59-e3a1a69718b7', 'John Doe', '(123) 456-7890', '123 Main St', 'john_doe@yopmail.com'),
                  ('c369c084-85f2-401f-857a-b98a43b711f8', 'Jane Smith', '(987) 654-3210', '456 Elm St', 'jane_smith@yopmail.com'),
                  ('bc6b6373-50e1-4c76-bbb7-e8f98ce8dca5', 'Alice Johnson', '(555) 867-5309', '789 Oak St', 'alice_johnson@yopmail.com'),
                  ('411a37f4-fee0-4bad-b72a-4e94eee4e25b', 'Bob Brown', '(444) 555-6666', '101 Pine St', 'bob_brown@yopmail.com'),
                  ('b851ff4a-0802-4ef1-95c9-22eeaae82514', 'Charlie White', '(333) 222-1111', '202 Maple St', 'charlie_white@yopmail.com');
            `);
    });
};
