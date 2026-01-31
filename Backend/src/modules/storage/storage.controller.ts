import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { UploadFileDto, FileResponseDto, FileUploadResponseDto } from './dto/storage.dto';
import { multerConfig } from '../../config/multer.config';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    // Дополнительная проверка размера файла
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxFileSize) {
      throw new HttpException(
        `File size ${file.size} bytes exceeds maximum allowed size of ${maxFileSize} bytes (50MB)`,
        HttpStatus.PAYLOAD_TOO_LARGE
      );
    }

    try {
      const { fileName, presignedUrl } = await this.storageService.uploadFile(file, uploadDto.path);
      return {
        success: true,
        fileName,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        presignedUrl,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('download/:fileName')
  async downloadFile(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const fileBuffer = await this.storageService.downloadFile(fileName);
      const fileInfo = await this.storageService.getFileInfo(fileName);
      
      res.set({
        'Content-Type': fileInfo.metaData['content-type'] || 'application/octet-stream',
        'Content-Length': fileInfo.size.toString(),
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      throw new HttpException(
        'Failed to download file',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('info/:fileName')
  async getFileInfo(@Param('fileName') fileName: string): Promise<any> {
    try {
      const fileInfo = await this.storageService.getFileInfo(fileName);
      return {
        success: true,
        fileName,
        size: fileInfo.size,
        lastModified: fileInfo.lastModified,
        etag: fileInfo.etag,
        metaData: fileInfo.metaData,
      };
    } catch (error) {
      throw new HttpException(
        'File not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('list')
  async listFiles(@Body() body: { prefix?: string }): Promise<any> {
    try {
      const files = await this.storageService.listFiles(body.prefix);
      return {
        success: true,
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          etag: file.etag,
        })),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to list files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('presigned/:fileName')
  async getPresignedUrl(
    @Param('fileName') fileName: string,
    @Body() body: { expiry?: number },
  ): Promise<{ success: boolean; url: string }> {
    try {
      const url = await this.storageService.getPresignedUrl(
        fileName,
        body.expiry || 3600,
      );
      return {
        success: true,
        url,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to generate presigned URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('presigned-upload/:fileName')
  async getPresignedUploadUrl(
    @Param('fileName') fileName: string,
    @Body() body: { expiry?: number },
  ): Promise<{ success: boolean; url: string }> {
    try {
      const url = await this.storageService.getPresignedUploadUrl(
        fileName,
        body.expiry || 3600,
      );
      return {
        success: true,
        url,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to generate presigned upload URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':fileName')
  async deleteFile(@Param('fileName') fileName: string): Promise<any> {
    try {
      await this.storageService.deleteFile(fileName);
      return {
        success: true,
        message: `File ${fileName} deleted successfully`,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
