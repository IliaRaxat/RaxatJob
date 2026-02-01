const { Client } = require('pg');

async function setupDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'raxatjob'"
    );

    if (checkDb.rows.length === 0) {
      await client.query('CREATE DATABASE raxatjob');
      console.log('✅ Database "raxatjob" created successfully');
    } else {
      console.log('ℹ️  Database "raxatjob" already exists');
    }

    await client.end();
    console.log('\n✅ Database setup complete!');
    console.log('Now run: npx prisma migrate dev');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
