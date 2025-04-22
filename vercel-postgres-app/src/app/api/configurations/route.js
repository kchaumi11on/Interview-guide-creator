import { executeQuery } from '@/lib/db-postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const configurations = await executeQuery(
      'SELECT * FROM saved_configurations ORDER BY created_at DESC'
    );
    return NextResponse.json(configurations);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, configuration_data } = await request.json();
    
    // Convert configuration_data to string if it's an object
    const configData = typeof configuration_data === 'object' 
      ? JSON.stringify(configuration_data) 
      : configuration_data;
    
    const result = await executeQuery(
      'INSERT INTO saved_configurations (name, configuration_data) VALUES ($1, $2) RETURNING *',
      [name, configData]
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
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 });
    }
    
    await executeQuery('DELETE FROM saved_configurations WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
