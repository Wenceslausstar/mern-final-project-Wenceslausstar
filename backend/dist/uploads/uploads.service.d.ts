export interface UploadedFile {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    url: string;
    path: string;
}
export declare class UploadsService {
    private readonly uploadDir;
    constructor();
    private ensureUploadDirectoryExists;
    saveFile(file: Express.Multer.File, userId: string, category?: string): Promise<UploadedFile>;
    saveMultipleFiles(files: Express.Multer.File[], userId: string, category?: string): Promise<UploadedFile[]>;
    deleteFile(filePath: string): Promise<void>;
    deleteMultipleFiles(filePaths: string[]): Promise<void>;
    private getSubDirectory;
    validateFileType(mimetype: string): boolean;
    validateFileSize(size: number, maxSize?: number): boolean;
    getFileStats(): Promise<any>;
}
