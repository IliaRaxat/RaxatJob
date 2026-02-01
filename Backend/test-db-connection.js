const { Client } = require('pg');

const passwords = ['password', 'postgres', '123456', 'admin', ''];

async function testConnection(password) {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: password,
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log(`✅ SUCCESS! Password is: "${password}"`);
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ Failed with password: "${password}"`);
    return false;
  }
}

async function main() {
  console.log('Testing PostgreSQL connection with different passwords...\n');
  
  for (const password of passwords) {
    const success = await testConnection(password);
    if (success) {
      console.log('\n✅ Connection successful!');
      console.log(`\nUpdate your Backend/.env file with:`);
      console.log(`DATABASE_URL="postgresql://postgres:${password}@localhost:5432/raxatjob?schema=public"`);
      process.exit(0);
    }
  }
  
  console.log('\n❌ None of the common passwords worked.');
  console.log('Please enter the password you set during PostgreSQL installation.');
  process.exit(1);
}

main();
