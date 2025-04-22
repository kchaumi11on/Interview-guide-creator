import { sql } from '@vercel/postgres';

export async function executeQuery(query, params = []) {
  try {
    const result = await sql.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function initializeDatabase() {
  // Create tables if they don't exist
  await sql`
    CREATE TABLE IF NOT EXISTS competencies (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      competency_id INTEGER REFERENCES competencies(id),
      question_text TEXT NOT NULL,
      follow_up TEXT,
      notes TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS interview_sessions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      date TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS interview_teams (
      id SERIAL PRIMARY KEY,
      session_id INTEGER REFERENCES interview_sessions(id),
      name TEXT NOT NULL,
      members TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS question_allocations (
      id SERIAL PRIMARY KEY,
      session_id INTEGER REFERENCES interview_sessions(id),
      team_id INTEGER REFERENCES interview_teams(id),
      question_id INTEGER REFERENCES questions(id),
      competency_id INTEGER REFERENCES competencies(id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS saved_configurations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      configuration_data TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function importSampleData(competencies, questions) {
  // Import competencies
  for (const comp of competencies) {
    const existingComp = await sql`SELECT id FROM competencies WHERE name = ${comp.name}`;
    if (existingComp.rows.length === 0) {
      await sql`INSERT INTO competencies (name, description) VALUES (${comp.name}, ${comp.description || ''})`;
    }
  }

  // Get all competencies to map names to IDs
  const compRows = await sql`SELECT id, name FROM competencies`;
  const compMap = {};
  compRows.rows.forEach(row => {
    compMap[row.name] = row.id;
  });

  // Import questions
  for (const q of questions) {
    const compId = compMap[q.competency];
    if (compId) {
      const existingQ = await sql`SELECT id FROM questions WHERE question_text = ${q.question_text}`;
      if (existingQ.rows.length === 0) {
        await sql`INSERT INTO questions (competency_id, question_text, follow_up, notes) 
                 VALUES (${compId}, ${q.question_text}, ${q.follow_up || ''}, ${q.notes || ''})`;
      }
    }
  }
}
