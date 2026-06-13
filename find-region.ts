import { Client } from 'pg';
import 'dotenv/config'; // Ensures your .env file is loaded

async function findRegion() {
  // Pulls your Neon URL straight from your .env file
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error('❌ Error: DATABASE_URL is missing from your .env file.');
    return null;
  }

  console.log('Connecting to Neon database...');
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false } // Ensures SSL works smoothly locally
  });

  try {
    await client.connect();
    console.log(`\n✅ SUCCESS! Connected to Neon database successfully.`);
    await client.end();
    return url;
  } catch (e: any) {
    console.error(`\n❌ Connection failed: ${e.message}`);
    return null;
  }
}

findRegion();