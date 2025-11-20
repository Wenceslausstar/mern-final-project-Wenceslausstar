"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const uploads_service_1 = require("./uploads.service");
let UploadsController = class UploadsController {
    uploadsService;
    constructor(uploadsService) {
        this.uploadsService = uploadsService;
    }
    async uploadSingleFile(file, req) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!this.uploadsService.validateFileSize(file.size)) {
            throw new common_1.BadRequestException('File too large');
        }
        const uploadedFile = await this.uploadsService.saveFile(file, req.user.id);
        return {
            message: 'File uploaded successfully',
            file: uploadedFile,
        };
    }
    async uploadMultipleFiles(files, req) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        for (const file of files) {
            if (!this.uploadsService.validateFileSize(file.size)) {
                throw new common_1.BadRequestException(`File ${file.originalname} is too large`);
            }
        }
        const uploadedFiles = await this.uploadsService.saveMultipleFiles(files, req.user.id);
        return {
            message: `${files.length} files uploaded successfully`,
            files: uploadedFiles,
        };
    }
    async uploadMedicalFiles(files, req) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No medical files uploaded');
        }
        for (const file of files) {
            if (!this.uploadsService.validateFileSize(file.size, 20 * 1024 * 1024)) {
                throw new common_1.BadRequestException(`File ${file.originalname} is too large`);
            }
        }
        const uploadedFiles = await this.uploadsService.saveMultipleFiles(files, req.user.id, 'medical');
        return {
            message: `${files.length} medical files uploaded successfully`,
            files: uploadedFiles,
        };
    }
    async deleteFile(filename, req) {
        await this.uploadsService.deleteFile(filename);
        return { message: 'File deleted successfully' };
    }
    async getUploadStats() {
        return this.uploadsService.getFileStats();
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('single'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/temp',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                callback(null, file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname));
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!this.uploadsService.validateFileType(file.mimetype)) {
                return callback(new common_1.BadRequestException('Invalid file type'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof Express !== "undefined" && (_a = Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadSingleFile", null);
__decorate([
    (0, common_1.Post)('multiple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/temp',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                callback(null, file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname));
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!this.uploadsService.validateFileType(file.mimetype)) {
                return callback(new common_1.BadRequestException('Invalid file type'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
            files: 10,
        },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Post)('medical'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/temp',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                callback(null, file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname));
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!this.uploadsService.validateFileType(file.mimetype)) {
                return callback(new common_1.BadRequestException('Invalid file type'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 20 * 1024 * 1024,
            files: 5,
        },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadMedicalFiles", null);
__decorate([
    (0, common_1.Delete)(':filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "getUploadStats", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('uploads'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [uploads_service_1.UploadsService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map