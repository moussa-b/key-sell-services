/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  if (process.env.DATABASE_URL?.length > 0) {
    return knex.schema.raw(`
    CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW
    SET NEW.updated_at = CURRENT_TIMESTAMP;
  `);
  }

  return knex.raw(`
  CREATE TRIGGER "update_clients_updated_at" AFTER UPDATE ON "clients" 
  FOR EACH ROW 
  BEGIN
    UPDATE clients
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
  END;`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`DROP TRIGGER IF EXISTS update_clients_updated_at;`);
};
