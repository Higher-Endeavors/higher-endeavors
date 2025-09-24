import pg from "pg";
import { serverLogger } from 'lib/logging/logger.server';
const { Pool } = pg;

// This is only to pass the pool to the Postgres adapter for AuthJS
export const pool = new Pool();

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on("error", async (err, client) => {
  await serverLogger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Use this for single queries that do not require a transaction
export const SingleQuery = (text, params, callback) => {
  return pool.query(text, params, callback);
};

// This is an example of how to code a transaction in a route
// ***** It is CRITICAL to release the client when done *****

/*

import { type NextRequest, NextResponse } from "next/server";
import { getClient } from "lib/dbAdapter";

const client = getClient();

export async function POST(request: NextRequest) {

  const { [some_params] } = await request.json();

  try {
    await client.query('BEGIN')
    const queryText = 'INSERT INTO [table]([column]) VALUES($1) RETURNING id'
    const res = await client.query(queryText, [some_params(1)])
   
    const insertText = 'INSERT INTO [table]([column1], [column2]) VALUES ($1, $2)'
    const insertValues = [(some_params(2))]
    await client.query(insertText, insertValues)
    await client.query('COMMIT')
    return NextResponse.json({ message: "Success: message stored" });
  } catch (error) {
    serverLogger.error('Database adapter error', error);
    
    NextResponse.json({ error: "COULD NOT STORE MESSAGE" }, { status: 500 });
  } finally {
    client.release()
  }
}

 */

// This is the basic way to get a client from the pool
/* 

export const getClient = () => {
    return pool.connect()
  }

*/

// This approach includes diagnostic logging for detecting
// idle clients that are not released back to the pool
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  // set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(async () => {
    await serverLogger.error('A client has been checked out for more than 5 seconds', null, {
      lastQuery: client.lastQuery
    });
  }, 5000);
  // monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  client.release = () => {
    // clear our timeout
    clearTimeout(timeout);
    // set the methods back to their old un-monkey-patched version
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  return client;
};
