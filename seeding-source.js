/* eslint-disable no-undef */
const { SeedingSource } = require('@concepta/typeorm-seeding');
const {
  CreateAdminSeeder,
  CreatePermissionsSeeder,
} = require('./dist/database/seeders');

const { AppDataSource } = require('./dist/data-source');

require('dotenv').config();

module.exports = new SeedingSource({
  dataSource: AppDataSource.options,
  seeders: [CreateAdminSeeder, CreatePermissionsSeeder], // array of Seeder classes
});
