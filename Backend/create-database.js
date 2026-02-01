const { Client } = require('pg');

const passwords = ['', 'postgres', 'admin', 'root', 'password', '123456', 'postgres123'];

async function tryCreateDatabase() {
  for (const password of passwords) {
    try {
      console.log(`Trying password: "${password || '(empty)'}"`);
      
      const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: password,
        database: 'postgres'
      });

      await client.connect();
      console.log('✅ Connected successfully!');
      
      // Check if database exists
      const res = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = 'raxatjob'"
      );
      
      if (res.rows.length === 0) {
        await client.query('CREATE DATABASE raxatjob');
        console.log('✅ Database "raxatjob" created successfully!');
      } else {
        console.log('✅ Database "raxatjob" already exists!');
      }
      
      await client.end();
      
      console.log(`\n🎉 SUCCESS! Your password is: "${password || '(empty)'}"`);
      console.log(`\nUpdate your .env file with:`);
      console.log(`DATABASE_URL="postgresql://postgres:${password}@localhost:5432/raxatjob?schema=public"`);
      
      return password;
    } catch (err) {
      console.log(`❌ Failed with password "${password || '(empty)'}": ${err.message}`);
    }
  }
  
  console.log('\n❌ None of the common passwords worked.');
  console.log('You need to reset your PostgreSQL password manually.');
}

tryCreateDatabase();
