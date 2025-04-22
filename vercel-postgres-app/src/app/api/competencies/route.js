import { executeQuery } from '@/lib/db-postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const competencies = await executeQuery('SELECT * FROM competencies ORDER BY name');
    return NextResponse.json(competencies);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, description } = await request.json();
    const result = await executeQuery(
      'INSERT INTO competencies (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, description } = await request.json();
    const result = await executeQuery(
      'UPDATE competencies SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
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
    await executeQuery('DELETE FROM competencies WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
