import { UserRole } from '../../users/schemas/user.schema';
export declare class RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    phoneNumber?: string;
    dateOfBirth?: Date;
    gender?: string;
    address?: string;
    specialization?: string;
    licenseNumber?: string;
}
