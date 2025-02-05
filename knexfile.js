/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: '.env' });

const filename = path.resolve(path.join(__dirname, './agency_db.sqlite'));
if (process.env.DATABASE_URL?.length > 0) {
  console.log(
    'Running knexfile.js with process.env.DATABASE_URL = ',
    obfuscateDatabaseString(process.env.DATABASE_URL),
  );
} else {
  console.log(
    'Running knexfile.js with process.env.DATABASE_FILE = ',
    filename,
  );
}

function obfuscateDatabaseString(connectionString) {
  return connectionString.replace(/:\/\/(.*?):(.*?)@/, (match, user) => {
    return `://${user}:*****@`;
  });
}

try {
  // Exécute la commande pour récupérer le chemin de npm
  const npmPath = execSync(
    process.platform === 'win32' ? 'where npm' : 'which npm',
  )
    .toString()
    .trim();
  console.log(`Path to npm: ${npmPath}`);
} catch (error) {
  console.error('Error fetching npm path:', error.message);
}

module.exports =
  process.env.DATABASE_URL?.length > 0
    ? {
        development: {
          client: 'mysql2',
          connection: process.env.DATABASE_URL,
          migrations: {
            tableName: 'knex_migrations',
            directory: './src/shared/db/migrations',
          },
          seeds: {
            directory: './src/shared/db/seeds',
          },
        },

        staging: {
          client: 'mysql2',
          connection: process.env.DATABASE_URL,
          migrations: {
            tableName: 'knex_migrations',
            directory: './src/shared/db/migrations',
          },
          seeds: {
            directory: './src/shared/db/seeds',
          },
        },

        production: {
          client: 'mysql2',
          connection: process.env.DATABASE_URL,
          migrations: {
            tableName: 'knex_migrations',
            directory: './src/shared/db/migrations',
          },
          seeds: {
            directory: './src/shared/db/seeds',
          },
        },
      }
    : {
        development: {
          client: 'sqlite3',
          connection: {
            filename: filename,
          },
          useNullAsDefault: true,
          migrations: {
            tableName: 'knex_migrations',
            directory: './src/shared/db/migrations',
          },
          seeds: {
            directory: './src/shared/db/seeds',
          },
        },

        staging: {
          client: 'sqlite3',
          connection: {
            filename: filename,
          },
          migrations: {
            tableName: 'knex_migrations',
            directory: './src/shared/db/migrations',
          },
          seeds: {
            directory: './src/shared/db/seeds',
          },
        },

        production: {
          client: 'sqlite3',
          connection: {
            filename: filename,
          },
          useNullAsDefault: true,
          migrations: {
            tableName: 'knex_migrations',
            directory: './src/shared/db/migrations',
          },
          seeds: {
            directory: './src/shared/db/seeds',
          },
        },
      };
