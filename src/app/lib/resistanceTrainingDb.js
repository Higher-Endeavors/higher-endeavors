const { Pool } = require('pg');

// Create a pool of connections
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Function to get all exercises
async function getAllExercises() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM resistance_training_exercise_library');
    client.release();
    return result.rows;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
}

// Function to get exercise by ID
async function getExerciseById(id) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM resistance_training_exercise_library WHERE id = $1', [id]);
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching exercise by ID:', error);
    throw error;
  }
}

module.exports = {
  getAllExercises,
  getExerciseById,
};