import { executeQuery } from '@/lib/db-postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    let sessions;
    if (id) {
      sessions = await executeQuery('SELECT * FROM interview_sessions WHERE id = $1', [id]);
      return NextResponse.json(sessions[0]);
    } else {
      sessions = await executeQuery('SELECT * FROM interview_sessions ORDER BY created_at DESC');
      return NextResponse.json(sessions);
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, date } = await request.json();
    const result = await executeQuery(
      'INSERT INTO interview_sessions (name, date) VALUES ($1, $2) RETURNING *',
      [name, date || '']
    );
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, date } = await request.json();
    const result = await executeQuery(
      'UPDATE interview_sessions SET name = $1, date = $2 WHERE id = $3 RETURNING *',
      [name, date || '', id]
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
    await executeQuery('DELETE FROM interview_sessions WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
