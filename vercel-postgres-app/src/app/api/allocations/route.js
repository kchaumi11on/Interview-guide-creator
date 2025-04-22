import { executeQuery } from '@/lib/db-postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    
    const allocations = await executeQuery(`
      SELECT qa.*, q.question_text, c.name as competency_name, t.name as team_name 
      FROM question_allocations qa
      JOIN questions q ON qa.question_id = q.id
      JOIN competencies c ON qa.competency_id = c.id
      JOIN interview_teams t ON qa.team_id = t.id
      WHERE qa.session_id = $1
    `, [sessionId]);
    
    return NextResponse.json(allocations);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { session_id, team_id, question_id, competency_id } = await request.json();
    
    // Check if allocation already exists
    const existing = await executeQuery(
      'SELECT * FROM question_allocations WHERE session_id = $1 AND team_id = $2 AND question_id = $3',
      [session_id, team_id, question_id]
    );
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'This question is already allocated to this team' }, { status: 400 });
    }
    
    const result = await executeQuery(
      'INSERT INTO question_allocations (session_id, team_id, question_id, competency_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [session_id, team_id, question_id, competency_id]
    );
    
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Allocation ID is required' }, { status: 400 });
    }
    
    await executeQuery('DELETE FROM question_allocations WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
