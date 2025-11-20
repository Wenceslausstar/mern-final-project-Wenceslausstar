import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  private static readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'image/dicom',
    'application/dicom',
  ];

  constructor(private readonly uploadsService: UploadsService) {}

  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          file &&
          !UploadsController.allowedMimeTypes.includes(file.mimetype)
        ) {
          return callback(new BadRequestException('Invalid file type'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file size
    if (!this.uploadsService.validateFileSize(file.size)) {
      throw new BadRequestException('File too large');
    }

    const uploadedFile = await this.uploadsService.saveFile(file, req.user.id);
    return {
      message: 'File uploaded successfully',
      file: uploadedFile,
    };
  }

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          file &&
          !UploadsController.allowedMimeTypes.includes(file.mimetype)
        ) {
          return callback(new BadRequestException('Invalid file type'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 10, // Maximum 10 files
      },
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Validate all files
    for (const file of files) {
      if (!this.uploadsService.validateFileSize(file.size)) {
        throw new BadRequestException(`File ${file.originalname} is too large`);
      }
    }

    const uploadedFiles = await this.uploadsService.saveMultipleFiles(
      files,
      req.user.id,
    );
    return {
      message: `${files.length} files uploaded successfully`,
      files: uploadedFiles,
    };
  }

  @Post('medical')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          file &&
          !UploadsController.allowedMimeTypes.includes(file.mimetype)
        ) {
          return callback(new BadRequestException('Invalid file type'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB for medical files
        files: 5,
      },
    }),
  )
  async uploadMedicalFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No medical files uploaded');
    }

    // Validate all files
    for (const file of files) {
      if (!this.uploadsService.validateFileSize(file.size, 20 * 1024 * 1024)) {
        throw new BadRequestException(`File ${file.originalname} is too large`);
      }
    }

    const uploadedFiles = await this.uploadsService.saveMultipleFiles(
      files,
      req.user.id,
      'medical',
    );
    return {
      message: `${files.length} medical files uploaded successfully`,
      files: uploadedFiles,
    };
  }

  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string, @Request() req) {
    // In a real application, you would check if the user owns the file
    await this.uploadsService.deleteFile(filename);
    return { message: 'File deleted successfully' };
  }

  @Get('stats')
  async getUploadStats() {
    return this.uploadsService.getFileStats();
  }
}
