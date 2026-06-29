import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async createRequest(employeeId: string, body: any, files: { [key: string]: Express.Multer.File[] }) {
    const employee = await this.prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const resumeFile = files['resume'] ? files['resume'][0] : null;
    const expLetterFile = files['experienceLetter'] ? files['experienceLetter'][0] : null;
    const aadhaarFile = files['aadhaar'] ? files['aadhaar'][0] : null;
    const supportingFiles = files['supportingDocs'] || [];

    if (!resumeFile || !expLetterFile || !aadhaarFile) {
      throw new BadRequestException('Required documents (Resume, Experience Letter, Aadhaar) are missing');
    }

    const supportingPaths = supportingFiles.map(file => `/uploads/${file.filename}`);

    return this.prisma.certificateRequest.create({
      data: {
        employeeId,
        employeeName: employee.name,
        employeeEmail: employee.email,
        skillsRequested: body.skillsRequested || '',
        duration: body.duration || '',
        attendance: parseInt(body.attendance || '0', 10),
        status: 'SUBMITTED',
        resumePath: `/uploads/${resumeFile.filename}`,
        experienceLetterPath: `/uploads/${expLetterFile.filename}`,
        aadhaarPath: `/uploads/${aadhaarFile.filename}`,
        supportingDocsPaths: JSON.stringify(supportingPaths),
      },
    });
  }

  async getEmployeeRequests(employeeId: string) {
    return this.prisma.certificateRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      include: { certificate: true },
    });
  }

  async getIncomingRequests() {
    return this.prisma.certificateRequest.findMany({
      where: { status: 'SUBMITTED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInProgressRequests() {
    return this.prisma.certificateRequest.findMany({
      where: {
        status: { in: ['FORWARDED', 'EVALUATED'] },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        evaluations: {
          include: {
            evaluator: {
              select: { name: true, designation: true },
            },
          },
        },
      },
    });
  }

  async forwardRequest(requestId: string, body: any) {
    const request = await this.prisma.certificateRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return this.prisma.certificateRequest.update({
      where: { id: requestId },
      data: {
        status: 'FORWARDED',
        skillsRequested: body.skills || request.skillsRequested,
        duration: body.duration || request.duration,
        attendance: parseInt(body.attendance || String(request.attendance), 10),
        currentEvaluatorId: body.evaluatorId,
        evaluatorRole: body.evaluatorRole || 'Team Manager',
      },
    });
  }

  async rejectRequest(requestId: string) {
    const request = await this.prisma.certificateRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return this.prisma.certificateRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
  }

  async getAiAnalysis(requestId: string) {
    const request = await this.prisma.certificateRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const loadFile = (relPath: string) => {
      if (!relPath) return undefined;
      try {
        const fullPath = require('path').join(__dirname, '..', '..', relPath);
        if (require('fs').existsSync(fullPath)) {
          const buffer = require('fs').readFileSync(fullPath);
          const ext = require('path').extname(relPath).toLowerCase();
          const mimeType = ext === '.pdf' ? 'application/pdf' : 
                           (ext === '.png' ? 'image/png' : 'image/jpeg');
          return {
            base64: buffer.toString('base64'),
            mimeType,
          };
        }
      } catch (err) {
        console.error('Error loading file for AI analysis:', relPath, err);
      }
      return undefined;
    };

    const resume = loadFile(request.resumePath);
    const expLetter = loadFile(request.experienceLetterPath);
    const aadhaar = loadFile(request.aadhaarPath);

    return this.aiService.analyzeSkills(
      request.employeeName,
      request.skillsRequested,
      request.attendance,
      resume,
      expLetter,
      aadhaar,
    );
  }
}
