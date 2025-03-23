// This script resets the database and applies migrations
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting database reset and migration...');

try {
  // Run prisma db push to update the schema directly (for development)
  console.log('Applying schema changes directly with db push...');
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  
  // Generate Prisma client based on the new schema
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Run the seed script to populate the database with initial data
  console.log('Seeding the database...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  
  console.log('Database reset and migration completed successfully!');
} catch (error) {
  console.error('Error during database reset:', error);
  process.exit(1);
} 