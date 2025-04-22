import { executeQuery } from '@/lib/db-postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    let teams;
    if (sessionId) {
      teams = await executeQuery('SELECT * FROM interview_teams WHERE session_id = $1', [sessionId]);
    } else {
      teams = await executeQuery('SELECT * FROM interview_teams');
    }
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { session_id, name, members } = await request.json();
    const result = await executeQuery(
      'INSERT INTO interview_teams (session_id, name, members) VALUES ($1, $2, $3) RETURNING *',
      [session_id, name, members]
    );
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, session_id, name, members } = await request.json();
    const result = await executeQuery(
      'UPDATE interview_teams SET session_id = $1, name = $2, members = $3 WHERE id = $4 RETURNING *',
      [session_id, name, members, id]
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
    await executeQuery('DELETE FROM interview_teams WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
