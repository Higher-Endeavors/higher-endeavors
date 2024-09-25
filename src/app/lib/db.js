const { Pool } = require('pg');

const pg_user = process.env.PGUSER
const pg_password = process.env.PGPASSWORD
const pg_database = process.env.PGDATABASE
const pg_host = process.env.PGHOST
const pg_port = process.env.PGPORT

const pool = new Pool({
  user: pg_user,
  host: pg_host,
  database: pg_database,
  password: pg_password,
  port: pg_port,
});

export default async function dbAdapter(req, res) {
  const query = {
    text: "INSERT INTO email_contacts(first_name, last_name, email_address, contact_message) VALUES($1, $2, $3, $4)",
    values: [firstname, lastname, email, message],
  };
  try {
    const res = await client.query(query);
    await client.end();
    return NextResponse.json({ message: "Success: message stored" });
  } catch (error) {
    console.log(error);
    NextResponse.json({ error: "COULD NOT STORE MESSAGE" }, { status: 500 });
  }
}
