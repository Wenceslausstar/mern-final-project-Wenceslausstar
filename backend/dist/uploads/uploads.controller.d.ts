import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadSingleFile(file: Express.Multer.File, req: any): Promise<{
        message: string;
        file: import("./uploads.service").UploadedFile;
    }>;
    uploadMultipleFiles(files: Express.Multer.File[], req: any): Promise<{
        message: string;
        files: import("./uploads.service").UploadedFile[];
    }>;
    uploadMedicalFiles(files: Express.Multer.File[], req: any): Promise<{
        message: string;
        files: import("./uploads.service").UploadedFile[];
    }>;
    deleteFile(filename: string, req: any): Promise<{
        message: string;
    }>;
    getUploadStats(): Promise<any>;
}
