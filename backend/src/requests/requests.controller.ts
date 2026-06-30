import { Controller, Post, Body, Get, Param, Patch, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';

const uploadStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException(`Unsupported file type: ${file.originalname}. Only PDF, JPG, and PNG are allowed.`), false);
  }
};

@ApiTags('Certificate Requests')
@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Post()
  @Roles('EMPLOYEE')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'resume', maxCount: 1 },
      { name: 'experienceLetter', maxCount: 1 },
      { name: 'aadhaar', maxCount: 1 },
      { name: 'supportingDocs', maxCount: 5 },
    ], { 
      storage: uploadStorage,
      fileFilter: fileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Employee submits a new certificate request' })
  async createRequest(
    @GetUser() user: any,
    @Body() body: any,
    @UploadedFiles() files: { [key: string]: Express.Multer.File[] },
  ) {
    return this.requestsService.createRequest(user.id, body, files);
  }

  @Get('employee')
  @Roles('EMPLOYEE')
  @ApiOperation({ summary: 'Employee fetches their requests' })
  async getEmployeeRequests(@GetUser() user: any) {
    return this.requestsService.getEmployeeRequests(user.id);
  }

  @Get('incoming')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin fetches incoming requests' })
  async getIncomingRequests() {
    return this.requestsService.getIncomingRequests();
  }

  @Get('in-progress')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin fetches requests in-progress' })
  async getInProgressRequests() {
    return this.requestsService.getInProgressRequests();
  }

  @Patch(':id/forward')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin forwards certificate request to an evaluator' })
  async forwardRequest(@Param('id') id: string, @Body() body: any) {
    return this.requestsService.forwardRequest(id, body);
  }

  @Patch(':id/reject')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin rejects certificate request' })
  async rejectRequest(@Param('id') id: string) {
    return this.requestsService.rejectRequest(id);
  }

  @Get(':id/ai-analysis')
  @Roles('ADMIN', 'EVALUATOR', 'EMPLOYEE')
  @ApiOperation({ summary: 'Retrieve AI pre-validated skill evaluation and rating analysis' })
  async getAiAnalysis(@Param('id') id: string) {
    return this.requestsService.getAiAnalysis(id);
  }
}
