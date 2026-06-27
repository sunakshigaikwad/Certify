import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  role: string; // ADMIN, EMPLOYEE, EVALUATOR

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  designation?: string;
}
