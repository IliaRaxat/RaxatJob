import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  path?: string;
}

export interface FileResponseDto {
  success: boolean;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface FileUploadResponseDto extends FileResponseDto {
  presignedUrl: string;
}

export class PresignedUrlDto {
  @IsOptional()
  @IsNumber()
  expiry?: number;
}
