/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('tasks_types', function (table) {
    table.increments('id').primary();
    table.string('label_fr');
    table.string('label_en');
    table.integer('display_order');
  });

  await knex('tasks_types').insert([
    {
      id: 1,
      label_fr: 'Signature du mandat + collecte de documents',
      label_en: 'Mandate signature + document collection',
      display_order: 1,
    },
    {
      id: 2,
      label_fr: 'Évaluation du bien',
      label_en: 'Property valuation',
      display_order: 2,
    },
    {
      id: 3,
      label_fr: "Préparation marketing (photos, vidéos, création de l'annonce)",
      label_en: 'Photos, videos, listing creation',
      display_order: 3,
    },
    {
      id: 4,
      label_fr: 'Mise en ligne sur les portails',
      label_en: 'Publishing on portals',
      display_order: 4,
    },
    {
      id: 5,
      label_fr: 'Organisation des visites',
      label_en: 'Organizing property viewings',
      display_order: 5,
    },
    {
      id: 6,
      label_fr: 'Retour de visite au vendeur',
      label_en: 'Viewing feedback to seller',
      display_order: 6,
    },
    {
      id: 7,
      label_fr: 'Négociation avec les acheteurs',
      label_en: 'Negotiating with buyers',
      display_order: 7,
    },
    {
      id: 8,
      label_fr: 'Réception et traitement des offres',
      label_en: 'Receiving and processing offers',
      display_order: 8,
    },
    {
      id: 9,
      label_fr: "Suivi du dossier notarial et de l'accord",
      label_en: 'Notary file and agreement',
      display_order: 9,
    },
    {
      id: 10,
      label_fr: 'Suivi des conditions (approbation du prêt, etc.)',
      label_en: 'Loan approval, etc.',
      display_order: 10,
    },
    {
      id: 11,
      label_fr: "Préparation de l'acte final",
      label_en: 'Preparing the final deed',
      display_order: 11,
    },
    {
      id: 12,
      label_fr: 'Remise des clés',
      label_en: 'Closing and handing over keys',
      display_order: 12,
    },
    {
      id: 13,
      label_fr: 'Suivi avec les prospects ou les vendeurs',
      label_en: 'Follow up with prospects or sellers',
      display_order: 13,
    },
    {
      id: 14,
      label_fr: 'Archivage du dossier',
      label_en: 'Archiving the file',
      display_order: 14,
    },
    { id: 15, label_fr: 'Autre', label_en: 'Other', display_order: 15 },
  ]);

  await knex.schema.createTable('tasks', (table) => {
    table.increments('id').unsigned().primary();
    table.string('uuid', 255);
    table.integer('type').unsigned();
    table.string('status', 255);
    table.string('title', 255).notNullable();
    table.string('description', 512);
    table.date('date').nullable();
    table.integer('duration').unsigned().nullable();
    table.integer('created_by').unsigned().nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.integer('updated_by').unsigned().nullable();
    table.timestamp('updated_at').nullable();

    table
      .foreign('type')
      .references('id')
      .inTable('tasks_types')
      .onDelete('RESTRICT');
    table
      .foreign('created_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .foreign('updated_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table.index('created_by', 'fk_tasks_created_by');
    table.index('updated_by', 'fk_tasks_updated_by');
    table.index('type', 'fk_tasks_types');
  });

  await knex.schema.createTable('tasks_real_estates', (table) => {
    table.integer('task_id').unsigned().notNullable().defaultTo(0);
    table.integer('real_estate_id').unsigned().notNullable().defaultTo(0);

    table.primary(['task_id', 'real_estate_id']);

    table
      .foreign('task_id')
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE');
    table
      .foreign('real_estate_id')
      .references('id')
      .inTable('real_estates')
      .onDelete('CASCADE');

    table.index('task_id', 'fk_task_id');
    table.index('real_estate_id', 'fk_real_estates_id');
  });

  await knex.schema.createTable('tasks_users', (table) => {
    table.integer('task_id').unsigned().notNullable().defaultTo(0);
    table.integer('user_id').unsigned().notNullable().defaultTo(0);

    table.primary(['task_id', 'user_id']);

    table
      .foreign('task_id')
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE');
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.index('task_id', 'fk_task_id');
    table.index('user_id', 'fk_user_id');
  });
};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('tasks_users');
  await knex.schema.dropTableIfExists('tasks_real_estates');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('tasks_types');
};
