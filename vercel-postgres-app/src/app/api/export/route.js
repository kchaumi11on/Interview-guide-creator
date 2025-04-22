import { executeQuery } from '@/lib/db-postgres';
import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    
    // Get session details
    const sessions = await executeQuery('SELECT * FROM interview_sessions WHERE id = $1', [sessionId]);
    if (sessions.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    const session = sessions[0];
    
    // Get teams for this session
    const teams = await executeQuery('SELECT * FROM interview_teams WHERE session_id = $1', [sessionId]);
    
    // Get allocations with question details
    const allocations = await executeQuery(`
      SELECT qa.*, q.question_text, q.follow_up, q.notes, c.name as competency_name, t.name as team_name, t.members
      FROM question_allocations qa
      JOIN questions q ON qa.question_id = q.id
      JOIN competencies c ON qa.competency_id = c.id
      JOIN interview_teams t ON qa.team_id = t.id
      WHERE qa.session_id = $1
      ORDER BY t.id, c.name
    `, [sessionId]);
    
    // Organize data by team
    const teamData = {};
    teams.forEach(team => {
      teamData[team.id] = {
        team: team,
        allocations: []
      };
    });
    
    allocations.forEach(allocation => {
      if (teamData[allocation.team_id]) {
        teamData[allocation.team_id].allocations.push(allocation);
      }
    });
    
    return NextResponse.json({
      session,
      teams: Object.values(teamData)
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
