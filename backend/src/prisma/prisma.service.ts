import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        console.log('Successfully connected to the database.');
        break;
      } catch (error) {
        retries--;
        console.warn(`Database connection failed. Retrying... (${retries} attempts left)`);
        if (retries === 0) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
