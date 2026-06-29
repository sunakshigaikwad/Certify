import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async analyzeSkills(name: string, skillsStr: string, attendance: number) {
    const skills = skillsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not found in environment, falling back to local analysis');
      return this.getLocalFallback(name, skills, attendance);
    }

    try {
      const prompt = `
You are an expert HR Skill Evaluator. Analyze the following candidate experience request and generate a structured evaluation JSON report.

Candidate Name: ${name}
Declared Skills: ${skills.join(', ')}
Attendance Rate: ${attendance}%

Return a JSON object exactly matching this schema:
{
  "skillsValidated": ["skill1", "skill2"],
  "scores": {
    "technical": number (1 to 5 integer),
    "communication": number (1 to 5 integer),
    "teamwork": number (1 to 5 integer),
    "punctuality": number (1 to 5 integer),
    "leadership": number (1 to 5 integer),
    "problemSolving": number (1 to 5 integer)
  },
  "overallRating": number (1 to 10 integer),
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "comments": "string (professional evaluation summary paragraph)"
}
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(rawText.trim());
      return {
        skillsValidated: parsed.skillsValidated || skills,
        validationMessage: "Skills validated successfully via Gemini AI.",
        scores: parsed.scores || {
          technical: 4,
          communication: 4,
          teamwork: 4,
          punctuality: 4,
          leadership: 4,
          problemSolving: 4,
        },
        overallRating: parsed.overallRating || 8,
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        suggestions: parsed.suggestions || [],
        comments: parsed.comments || `${name} has demonstrated competency in declared skills.`,
      };

    } catch (error) {
      this.logger.error('Gemini AI integration error, falling back to local analysis', error);
      return this.getLocalFallback(name, skills, attendance);
    }
  }

  private getLocalFallback(name: string, skills: string[], attendance: number) {
    const technical = Math.min(5, Math.max(3, Math.floor(skills.length / 2) + 2));
    const communication = Math.min(5, Math.max(3, Math.floor(attendance / 30) + 1));
    const teamwork = Math.min(5, Math.max(3, Math.floor(attendance / 25) + 1));
    const punctuality = Math.min(5, Math.max(2, Math.floor(attendance / 20)));
    const leadership = Math.min(5, Math.max(2, Math.floor((attendance + skills.length * 5) / 30)));
    const problemSolving = Math.min(5, Math.max(3, Math.floor((technical + teamwork) / 2)));
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
      validationMessage: "Skills validated successfully (Fallback Mode).",
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
