"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
let UploadsService = class UploadsService {
    uploadDir = 'uploads';
    constructor() {
        this.ensureUploadDirectoryExists();
    }
    async ensureUploadDirectoryExists() {
        try {
            await fs_1.promises.access(this.uploadDir);
        }
        catch {
            await fs_1.promises.mkdir(this.uploadDir, { recursive: true });
            await fs_1.promises.mkdir(path.join(this.uploadDir, 'images'), { recursive: true });
            await fs_1.promises.mkdir(path.join(this.uploadDir, 'documents'), {
                recursive: true,
            });
            await fs_1.promises.mkdir(path.join(this.uploadDir, 'medical'), { recursive: true });
        }
    }
    async saveFile(file, userId, category = 'general') {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const subDir = this.getSubDirectory(file.mimetype, category);
        const filePath = path.join(this.uploadDir, subDir, fileName);
        await fs_1.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs_1.promises.writeFile(filePath, file.buffer);
        const uploadedFile = {
            filename: fileName,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${subDir}/${fileName}`,
            path: filePath,
        };
        return uploadedFile;
    }
    async saveMultipleFiles(files, userId, category = 'general') {
        const uploadPromises = files.map((file) => this.saveFile(file, userId, category));
        return Promise.all(uploadPromises);
    }
    async deleteFile(filePath) {
        try {
            const relativePath = filePath.startsWith('/uploads/')
                ? filePath.substring(9)
                : filePath;
            const fullPath = path.join(this.uploadDir, relativePath);
            await fs_1.promises.unlink(fullPath);
        }
        catch (error) {
            console.warn(`Failed to delete file ${filePath}:`, error);
        }
    }
    async deleteMultipleFiles(filePaths) {
        const deletePromises = filePaths.map((filePath) => this.deleteFile(filePath));
        await Promise.all(deletePromises);
    }
    getSubDirectory(mimetype, category) {
        if (mimetype.startsWith('image/')) {
            return 'images';
        }
        else if (mimetype === 'application/pdf' ||
            mimetype.startsWith('text/') ||
            mimetype.includes('document')) {
            return category === 'medical' ? 'medical' : 'documents';
        }
        else {
            return 'documents';
        }
    }
    validateFileType(mimetype) {
        const allowedTypes = [
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
        return allowedTypes.includes(mimetype);
    }
    validateFileSize(size, maxSize = 10 * 1024 * 1024) {
        return size <= maxSize;
    }
    getFileStats() {
        return Promise.resolve({
            totalFiles: 0,
            totalSize: 0,
            categories: {},
        });
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map