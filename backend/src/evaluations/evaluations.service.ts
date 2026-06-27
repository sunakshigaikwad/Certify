import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  async getPendingEvaluations(evaluatorId: string) {
    return this.prisma.certificateRequest.findMany({
      where: {
        status: 'FORWARDED',
        currentEvaluatorId: evaluatorId,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getCompletedEvaluations(evaluatorId: string) {
    return this.prisma.evaluation.findMany({
      where: { evaluatorId },
      include: {
        request: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitEvaluation(evaluatorId: string, requestId: string, body: any) {
    const request = await this.prisma.certificateRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Certificate request not found');
    }

    if (request.status !== 'FORWARDED' || request.currentEvaluatorId !== evaluatorId) {
      throw new BadRequestException('Request is not in a valid state for evaluation by you');
    }

    // Save evaluation to db
    const evaluation = await this.prisma.evaluation.create({
      data: {
        requestId,
        evaluatorId,
        technicalSkills: parseInt(body.technicalSkills || '0', 10),
        communication: parseInt(body.communication || '0', 10),
        teamwork: parseInt(body.teamwork || '0', 10),
        punctuality: parseInt(body.punctuality || '0', 10),
        leadership: parseInt(body.leadership || '0', 10),
        problemSolving: parseInt(body.problemSolving || '0', 10),
        overallRating: parseInt(body.overallRating || '0', 10),
        comments: body.comments || '',
        approved: body.approved === true || body.approved === 'true',
      },
    });

    // Update request status
    const newStatus = evaluation.approved ? 'EVALUATED' : 'REJECTED';
    await this.prisma.certificateRequest.update({
      where: { id: requestId },
      data: { status: newStatus },
    });

    return evaluation;
  }
}
