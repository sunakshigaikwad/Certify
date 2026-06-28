import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users Management')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('evaluators')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin adds a new evaluator' })
  async createEvaluator(@GetUser() user: any, @Body() body: any) {
    return this.usersService.createEvaluator(user.id, body);
  }

  @Get('evaluators')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin fetches all evaluators' })
  async getEvaluators(@GetUser() user: any) {
    return this.usersService.getTeamMembers(user.id);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update user status (ACTIVE/INACTIVE)' })
  async updateStatus(@Param('id') userId: string, @Body('status') status: string) {
    return this.usersService.updateUserStatus(userId, status);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') userId: string) {
    return this.usersService.deleteUser(userId);
  }

  @Patch('profile/update')
  @ApiOperation({ summary: 'Update current user profile info' })
  async updateProfile(@GetUser() user: any, @Body() body: { name?: string; designation?: string }) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Patch('profile/change-password')
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(@GetUser() user: any, @Body() body: any) {
    return this.usersService.changePassword(user.id, body);
  }
}
