import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '../../users/schemas/user.schema';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userModel;
    constructor(configService: ConfigService, userModel: Model<UserDocument>);
    validate(payload: any): Promise<{
        id: import("mongoose").Types.ObjectId;
        email: string;
        role: import("../../users/schemas/user.schema").UserRole;
        firstName: string;
        lastName: string;
    }>;
}
export {};
