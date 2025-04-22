import { executeQuery } from '@/lib/db-postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const competencyId = searchParams.get('competencyId');
    
    let questions;
    if (competencyId) {
      questions = await executeQuery(
        'SELECT q.*, c.name as competency FROM questions q JOIN competencies c ON q.competency_id = c.id WHERE q.competency_id = $1 ORDER BY q.id',
        [competencyId]
      );
    } else {
      questions = await executeQuery(
        'SELECT q.*, c.name as competency FROM questions q JOIN competencies c ON q.competency_id = c.id ORDER BY q.id'
      );
    }
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { competency_id, question_text, follow_up, notes } = await request.json();
    const result = await executeQuery(
      'INSERT INTO questions (competency_id, question_text, follow_up, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [competency_id, question_text, follow_up || '', notes || '']
    );
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, competency_id, question_text, follow_up, notes } = await request.json();
    const result = await executeQuery(
      'UPDATE questions SET competency_id = $1, question_text = $2, follow_up = $3, notes = $4 WHERE id = $5 RETURNING *',
      [competency_id, question_text, follow_up || '', notes || '', id]
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
    await executeQuery('DELETE FROM questions WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
