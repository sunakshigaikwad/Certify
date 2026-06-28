import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createEvaluator(adminId: string, data: any) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'EVALUATOR', // Set role to evaluator
        designation: data.designation,
        status: 'ACTIVE',
        organizationId: admin.organizationId,
        teamManagerId: adminId, // Linked to the admin who created them
      },
    });
  }

  async getTeamMembers(adminId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    return this.prisma.user.findMany({
      where: {
        organizationId: admin.organizationId,
        role: 'EVALUATOR',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserStatus(userId: string, status: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.delete({ where: { id: userId } });
  }

  async updateProfile(userId: string, data: { name?: string; designation?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name ?? user.name,
        designation: data.designation ?? user.designation,
      },
    });
  }

  async changePassword(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(data.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new ConflictException('Incorrect old password');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.newPassword, salt);
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
