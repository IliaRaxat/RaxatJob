import { Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly minioClient: Minio.Client;
    private readonly bucketName = 'smartmatch';

    constructor(private configService: ConfigService) {
        // Используем локальный MinIO или настраиваем подключение к внешнему
        const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost');
        const port = parseInt(this.configService.get('MINIO_PORT', '9000'));
        const useSSL = this.configService.get('MINIO_USE_SSL', 'false') === 'true';
        
        this.minioClient = new Minio.Client({
            endPoint: 'storage.vchugaev.ru',
            port: 443,
            useSSL: true,
            accessKey: 'adminuser',
            secretKey: 'strongpassword'
        });

        this.initializeBucket();
    }

    private async initializeBucket() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                this.logger.log(`Bucket ${this.bucketName} created successfully`);
            } else {
                this.logger.log(`Bucket ${this.bucketName} already exists`);
            }
        } catch (error) {
            this.logger.error('Error initializing bucket:', error);
        }
    }

    async uploadFile(file: Express.Multer.File, path?: string): Promise<{ fileName: string; presignedUrl: string }> {
        try {
            const fileName = path ? `${path}/${file.originalname}` : file.originalname;

            await this.minioClient.putObject(
                this.bucketName,
                fileName,
                file.buffer,
                file.size,
                {
                    'Content-Type': file.mimetype,
                }
            );

            const presignedUrl = await this.minioClient.presignedGetObject(this.bucketName, fileName, 7 * 24 * 3600);

            this.logger.log(`File uploaded successfully: ${fileName}`);
            return { fileName, presignedUrl };
        } catch (error) {
            this.logger.error('Error uploading file:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    async downloadFile(fileName: string): Promise<Buffer> {
        try {
            const stream = await this.minioClient.getObject(this.bucketName, fileName);

            return new Promise((resolve, reject) => {
                const chunks: Buffer[] = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        } catch (error) {
            this.logger.error('Error downloading file:', error);
            throw new Error('Failed to download file');
        }
    }

    async deleteFile(fileName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, fileName);
            this.logger.log(`File deleted successfully: ${fileName}`);
        } catch (error) {
            this.logger.error('Error deleting file:', error);
            throw new Error('Failed to delete file');
        }
    }

    async getFileInfo(fileName: string): Promise<any> {
        try {
            const stat = await this.minioClient.statObject(this.bucketName, fileName);
            return stat;
        } catch (error) {
            this.logger.error('Error getting file info:', error);
            throw new Error('Failed to get file info');
        }
    }

    async listFiles(prefix?: string): Promise<any[]> {
        try {
            const objectsList: any[] = [];
            const stream = this.minioClient.listObjects(this.bucketName, prefix, true);

            return new Promise((resolve, reject) => {
                stream.on('data', (obj) => objectsList.push(obj));
                stream.on('end', () => resolve(objectsList));
                stream.on('error', reject);
            });
        } catch (error) {
            this.logger.error('Error listing files:', error);
            throw new Error('Failed to list files');
        }
    }

    async getPresignedUrl(fileName: string, expiry: number = 3600): Promise<string> {
        try {
            const url = await this.minioClient.presignedGetObject(this.bucketName, fileName, expiry);
            return url;
        } catch (error) {
            this.logger.error('Error generating presigned URL:', error);
            throw new Error('Failed to generate presigned URL');
        }
    }

    async getPresignedUploadUrl(fileName: string, expiry: number = 3600): Promise<string> {
        try {
            const url = await this.minioClient.presignedPutObject(this.bucketName, fileName, expiry);
            return url;
        } catch (error) {
            this.logger.error('Error generating presigned upload URL:', error);
            throw new Error('Failed to generate presigned upload URL');
        }
    }
}
