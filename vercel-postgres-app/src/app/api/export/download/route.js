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
    
    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Interview Allocation App';
    workbook.created = new Date();
    
    // Add a worksheet for each team
    for (const team of teams) {
      const teamAllocations = allocations.filter(a => a.team_id === team.id);
      if (teamAllocations.length === 0) continue;
      
      const worksheet = workbook.addWorksheet(team.name);
      
      // Add title and instructions
      worksheet.mergeCells('A1:E1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `Interview Guide: ${session.name}`;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: 'center' };
      
      worksheet.mergeCells('A2:E2');
      const subtitleCell = worksheet.getCell('A2');
      subtitleCell.value = `Team: ${team.name} - ${team.members}`;
      subtitleCell.font = { size: 14, bold: true };
      subtitleCell.alignment = { horizontal: 'center' };
      
      worksheet.mergeCells('A3:E3');
      const dateCell = worksheet.getCell('A3');
      dateCell.value = `Date: ${session.date || 'TBD'}`;
      dateCell.font = { size: 12 };
      dateCell.alignment = { horizontal: 'center' };
      
      worksheet.mergeCells('A5:E5');
      const instructionsCell = worksheet.getCell('A5');
      instructionsCell.value = 'Instructions: Use this guide to conduct the interview. Record candidate responses directly in the "Response" column.';
      instructionsCell.font = { italic: true };
      
      // Add headers
      worksheet.addRow([]);
      const headerRow = worksheet.addRow(['Competency', 'Question', 'Follow-up', 'Notes', 'Response']);
      headerRow.font = { bold: true };
      headerRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      // Group by competency
      const competencyGroups = {};
      teamAllocations.forEach(allocation => {
        if (!competencyGroups[allocation.competency_name]) {
          competencyGroups[allocation.competency_name] = [];
        }
        competencyGroups[allocation.competency_name].push(allocation);
      });
      
      // Add data rows
      Object.entries(competencyGroups).forEach(([competency, allocations]) => {
        allocations.forEach((allocation, index) => {
          const dataRow = worksheet.addRow([
            index === 0 ? competency : '',
            allocation.question_text,
            allocation.follow_up || '',
            allocation.notes || '',
            ''
          ]);
          
          // Apply borders
          dataRow.eachCell(cell => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
          
          // Make response column taller
          dataRow.height = 60;
        });
      });
      
      // Set column widths
      worksheet.getColumn(1).width = 20;
      worksheet.getColumn(2).width = 40;
      worksheet.getColumn(3).width = 30;
      worksheet.getColumn(4).width = 30;
      worksheet.getColumn(5).width = 40;
    }
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Return the Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="interview_guide_${session.name.replace(/\s+/g, '_')}.xlsx"`
      }
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
