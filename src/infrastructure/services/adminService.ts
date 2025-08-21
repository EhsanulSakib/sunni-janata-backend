import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import { IAdmin, IAdminDocument } from "../db/adminModel";
import { IAdminRepository } from "../repositories/adminRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IAdminService {
  login(
    uid: number,
    password: string
  ): Promise<{ data: IAdminDocument; token: string }>;
  register(data: IAdmin): Promise<IAdminDocument>;
  update(
    id: number,
    oldPassword: string,
    password: string
  ): Promise<IAdminDocument>;
}

export default class AdminService implements IAdminService {
  Repository: IAdminRepository;
  constructor(Repository: IAdminRepository) {
    this.Repository = Repository;
  }
  async login(
    uid: number,
    password: string
  ): Promise<{ data: IAdminDocument; token: string }> {
    // checking wether or not the admin exists
    const admin = await this.Repository.findByUID(uid);
    if (!admin) throw new AppError(StatusCodes.NOT_FOUND, "Admin not found");
    // comparing the passwords
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect)
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    // signing the api
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );
    return { data: admin, token };
  }
  async register(data: IAdmin): Promise<IAdminDocument> {
    // checking wether or not the userid exists
    const user = await this.Repository.findByUID(data.userId);
    if (user) throw new AppError(StatusCodes.CONFLICT, "Admin already exists");
    // creating password hash
    const hashedPassword = await bcrypt.hash(
      data.password,
      Number(process.env.SALT_ROUND || 5)
    );
    data.password = hashedPassword;
    return await this.Repository.create(data);
  }
  async update(
    id: number,
    oldPassword: string,
    password: string
  ): Promise<IAdminDocument> {
    const admin = await this.Repository.findByUID(id);
    if (!admin) throw new AppError(StatusCodes.NOT_FOUND, "Admin not found");
    const isPasswordCorrect = await bcrypt.compare(oldPassword, admin.password);
    if (!isPasswordCorrect)
      throw new AppError(StatusCodes.UNAUTHORIZED, "wrong password");
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUND || 5)
    );
    return await this.Repository.findByIdAndUpdate(admin._id as string, {
      password: hashedPassword,
    });
  }
}
