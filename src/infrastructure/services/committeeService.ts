import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import catchAsync from "../../shared/utils/catch_async";
import { IPagination } from "../../shared/utils/query_builder";
import sendResponse from "../../shared/utils/send_response";
import { ICommittee, ICommitteeDocument } from "../db/committeeModel";
import CommitteePolicy from "../policies/committeePolicy";
import { ICommitteeRepository } from "../repositories/committeeRepository";
import { Request, Response } from "express";
import { DeleteResult } from "mongoose";

export interface ICommitteeService {
  getCommittee(query: Record<string, unknown>): Promise<{pagination: IPagination; committees: ICommittee[]}>;
  getCommitteeById(id: string): Promise<ICommittee>;
  createCommittee(committee: ICommittee): Promise<any>;
  updateCommittee(id: string, committee: Partial<ICommittee>): Promise<ICommitteeDocument | null>;
  deleteCommittee(id: string): Promise<ICommitteeDocument | null>;
}

export class CommitteeService implements ICommitteeService {
  CommitteeRepository: ICommitteeRepository;
  constructor(CommitteeRepository: ICommitteeRepository) {
    this.CommitteeRepository = CommitteeRepository;
  }

  async getCommittee(query: Record<string, unknown>): Promise<{pagination: IPagination; committees: ICommittee[]}> {
    const committees = await this.CommitteeRepository.getCommittee(query);
    return committees;
  }

  async getCommitteeById(id: string): Promise<ICommitteeDocument> {
    const committee = await this.CommitteeRepository.getCommitteeById(id);
    if(!committee) throw new AppError(StatusCodes.NOT_FOUND, "Committee not found")
    return committee;
  }

  async createCommittee(committee: ICommittee): Promise<any> {
    const newCommittee = await this.CommitteeRepository.create(committee);
    return newCommittee;
  }

  async updateCommittee(id: string, committee: Partial<ICommittee>): Promise<ICommitteeDocument | null> {
    const updatedCommittee = await this.CommitteeRepository.update(id, committee);
    if(!updatedCommittee) throw new AppError(StatusCodes.NOT_FOUND, "Committee not found")
    return updatedCommittee;
  }

  async deleteCommittee(id: string): Promise<ICommitteeDocument | null> {
    const deletedCommittee = await this.CommitteeRepository.delete(id);

    if(!deletedCommittee) throw new AppError(StatusCodes.NOT_FOUND, "Committee not found")
      
    return deletedCommittee;
  }  
}