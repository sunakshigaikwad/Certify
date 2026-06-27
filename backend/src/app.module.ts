import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RequestsModule } from './requests/requests.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { CertificatesModule } from './certificates/certificates.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RequestsModule,
    EvaluationsModule,
    CertificatesModule,
    BlockchainModule,
    AiModule,
  ],
})
export class AppModule {}
