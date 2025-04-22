import { initializeDatabase } from '@/lib/db-postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    await initializeDatabase();
    
    return NextResponse.json({ 
      status: 'ok',
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
