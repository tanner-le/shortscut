const crypto = require('crypto');

// Generate a random key for admin setup
const key = crypto.randomBytes(32).toString('hex');

console.log('\n===== ADMIN SETUP KEY =====\n');
console.log(key);
console.log('\n===========================\n');
console.log('Add this key to your .env file as ADMIN_SETUP_KEY');
console.log('This key will be required to set up the initial admin account.\n'); 