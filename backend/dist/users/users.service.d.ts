import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findAll(): Promise<UserDocument[]>;
    findById(id: string): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findByRole(role: UserRole): Promise<UserDocument[]>;
    update(id: string, updateData: Partial<User>): Promise<UserDocument>;
    delete(id: string): Promise<void>;
    updateProfile(id: string, profileData: Partial<User>): Promise<UserDocument>;
}
