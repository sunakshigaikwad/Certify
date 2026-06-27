import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Post('issue/:requestId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin generates PDF certificate, records to blockchain and sends email' })
  async issue(@Param('requestId') requestId: string) {
    return this.certificatesService.issueCertificate(requestId);
  }

  @Get('verify/:certificateId')
  @ApiOperation({ summary: 'Verify certificate by ID (Public verifier check)' })
  async verify(@Param('certificateId') certificateId: string) {
    return this.certificatesService.verifyCertificate(certificateId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLOYEE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all issued certificates' })
  async list() {
    return this.certificatesService.getAllCertificates();
  }
}
