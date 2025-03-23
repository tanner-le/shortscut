// A simple script to generate SQL from Prisma schema
const { exec } = require('child_process');
const fs = require('fs');

// Run the Prisma command to generate SQL
exec('npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  // Save the SQL to a file
  fs.writeFile('migration.sql', stdout, (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`);
      return;
    }
    console.log('SQL migration script successfully written to migration.sql');
  });
}); 