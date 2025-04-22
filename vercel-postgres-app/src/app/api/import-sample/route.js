import { initializeDatabase, importSampleData } from '@/lib/db-postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    // Sample competencies data
    const competencies = [
      { name: "Strategic Execution", description: "Ability to implement and execute strategic initiatives" },
      { name: "Leadership", description: "Ability to lead and inspire teams" },
      { name: "Problem Solving", description: "Ability to analyze and solve complex problems" },
      { name: "Communication", description: "Ability to communicate effectively with various stakeholders" },
      { name: "Technical Expertise", description: "Relevant technical knowledge and skills" }
    ];
    
    // Sample questions data
    const questions = [
      { competency: "Strategic Execution", question_text: "Describe a time when you had to implement a strategic initiative. What was your approach?", follow_up: "What challenges did you face and how did you overcome them?", notes: "Look for structured approach and results orientation" },
      { competency: "Strategic Execution", question_text: "How do you ensure that strategic goals are translated into actionable plans?", follow_up: "Can you provide a specific example?", notes: "Assess ability to break down high-level goals" },
      { competency: "Strategic Execution", question_text: "Tell me about a time when you had to adjust your execution plan due to changing circumstances.", follow_up: "How did you adapt?", notes: "Look for flexibility and adaptability" },
      { competency: "Leadership", question_text: "Describe your leadership style and how it has evolved over time.", follow_up: "How do you adapt your style to different team members?", notes: "Assess self-awareness and adaptability" },
      { competency: "Leadership", question_text: "Tell me about a time when you had to lead a team through a difficult situation.", follow_up: "What was your approach and what was the outcome?", notes: "Look for resilience and team motivation skills" },
      { competency: "Problem Solving", question_text: "Describe a complex problem you faced and how you approached solving it.", follow_up: "What analytical methods did you use?", notes: "Assess structured thinking and analytical skills" },
      { competency: "Problem Solving", question_text: "How do you approach problems with incomplete information?", follow_up: "Can you provide an example?", notes: "Look for comfort with ambiguity" },
      { competency: "Communication", question_text: "Describe a situation where you had to communicate a complex idea to a non-technical audience.", follow_up: "How did you ensure understanding?", notes: "Assess ability to translate complex concepts" },
      { competency: "Communication", question_text: "Tell me about a time when you had to deliver difficult feedback.", follow_up: "How did you approach it and what was the outcome?", notes: "Look for empathy and clarity" },
      { competency: "Technical Expertise", question_text: "How do you stay current with developments in your field?", follow_up: "What recent development have you incorporated into your work?", notes: "Assess continuous learning mindset" }
    ];
    
    // Import sample data
    await importSampleData(competencies, questions);
    
    return NextResponse.json({ success: true, message: 'Database initialized with sample data' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
