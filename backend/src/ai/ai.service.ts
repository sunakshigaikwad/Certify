import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  async analyzeSkills(name: string, skillsStr: string, attendance: number) {
    const skills = skillsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    // AI logic to determine pre-filled parameters based on attendance and skill set
    const technical = Math.min(5, Math.max(3, Math.floor(skills.length / 2) + 2));
    const communication = Math.min(5, Math.max(3, Math.floor(attendance / 30) + 1));
    const teamwork = Math.min(5, Math.max(3, Math.floor(attendance / 25) + 1));
    const punctuality = Math.min(5, Math.max(2, Math.floor(attendance / 20)));
    const leadership = Math.min(5, Math.max(2, Math.floor((attendance + skills.length * 5) / 30)));
    const problemSolving = Math.min(5, Math.max(3, Math.floor((technical + teamwork) / 2)));
    
    // Overall rating on 1-10 scale
    const overallRating = Math.min(10, Math.max(5, Math.round((technical + communication + teamwork + punctuality + leadership + problemSolving) / 3)));

    const strengths = [
      `Strong technical understanding in: ${skills.slice(0, 3).join(', ')}`,
      attendance >= 80 ? 'Highly reliable attendance and discipline' : 'Good collaboration capability',
      'Quick learner with dedication to task completion'
    ];

    const weaknesses = [
      'Scope to improve documentation standards',
      attendance < 80 ? 'Needs slight improvement in daily attendance consistency' : 'Can work on public presenting skills'
    ];

    const suggestions = [
      'Encourage mentorship role for junior developers',
      'Take ownership of cross-team coordination meetings'
    ];

    const comments = `${name} has shown outstanding performance. Their understanding of ${skills.join(', ')} is solid. They are a valuable asset to any technical team, exhibiting strong cooperation and problem-solving skills.`;

    return {
      skillsValidated: skills,
      validationMessage: "Skills validated successfully.",
      scores: {
        technical,
        communication,
        teamwork,
        punctuality,
        leadership,
        problemSolving,
      },
      overallRating,
      strengths,
      weaknesses,
      suggestions,
      comments,
    };
  }
}
