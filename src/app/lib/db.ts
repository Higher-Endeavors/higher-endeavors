/* import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

let isConnected = false;

export async function connectToDatabase() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
}

export async function query(text: string, params: any[]) {
  await connectToDatabase();
  return client.query(text, params);
}

// Add more database-related functions as needed
 */