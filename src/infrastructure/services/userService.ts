import { ApproveStatus } from "../../shared/utils/enums";
import { IUser, IUserDocument } from "../db/userModel";

export interface IUserService {
    requestRegistration(data: IUser): Promise<IUserDocument>;
    requestOTP(phone: string): Promise<{otp: number, phone: string}>
    verifyOTP(phone: string, otp: number): Promise<boolean>;
    updateAccountStatus(id: string, status: ApproveStatus): Promise<IUserDocument>;
    
}