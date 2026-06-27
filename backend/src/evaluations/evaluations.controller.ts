import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Evaluations')
@Controller('evaluations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EvaluationsController {
  constructor(private evaluationsService: EvaluationsService) {}

  @Get('pending')
  @Roles('EVALUATOR')
  @ApiOperation({ summary: 'Evaluator lists pending requests assigned for their review' })
  async getPending(@GetUser() user: any) {
    return this.evaluationsService.getPendingEvaluations(user.id);
  }

  @Get('completed')
  @Roles('EVALUATOR')
  @ApiOperation({ summary: 'Evaluator lists evaluations they completed' })
  async getCompleted(@GetUser() user: any) {
    return this.evaluationsService.getCompletedEvaluations(user.id);
  }

  @Post(':requestId')
  @Roles('EVALUATOR')
  @ApiOperation({ summary: 'Evaluator submits candidate skill ratings and approval decision' })
  async submit(
    @GetUser() user: any,
    @Param('requestId') requestId: string,
    @Body() body: any,
  ) {
    return this.evaluationsService.submitEvaluation(user.id, requestId, body);
  }
}
