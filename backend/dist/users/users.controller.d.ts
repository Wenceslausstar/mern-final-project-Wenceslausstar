import { UsersService } from './users.service';
import { UserRole } from './schemas/user.schema';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(role?: UserRole): Promise<import("./schemas/user.schema").UserDocument[]>;
    findDoctors(): Promise<import("./schemas/user.schema").UserDocument[]>;
    getProfile(req: any): Promise<import("./schemas/user.schema").UserDocument>;
    findOne(id: string): Promise<import("./schemas/user.schema").UserDocument>;
    updateProfile(req: any, updateData: any): Promise<import("./schemas/user.schema").UserDocument>;
    update(id: string, updateData: any): Promise<import("./schemas/user.schema").UserDocument>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
