import { UpdateResult } from "mongoose";
import { IPagination } from "../../shared/utils/query_builder";
import {
  IContactMessage,
  IContactMessageDocument,
} from "../db/contactMessageModel";
import { IContactMessageRepository } from "../repositories/contactMessageRepository";

export interface IContactMessageService {
  create(data: IContactMessage): Promise<IContactMessageDocument>;
  getAll(query: Record<string, unknown>): Promise<{
    pagination: IPagination;
    data: IContactMessageDocument[];
    unseen: number;
  }>;
  getById(id: string): Promise<IContactMessageDocument>;
  delete(id: string): Promise<IContactMessageDocument>;
  markRead(): Promise<UpdateResult>;
}

export class ContactMessageService implements IContactMessageService {
  ContactMessageRepository: IContactMessageRepository;
  constructor(ContactMessageRepository: IContactMessageRepository) {
    this.ContactMessageRepository = ContactMessageRepository;
  }

  async create(data: IContactMessage): Promise<IContactMessageDocument> {
    return this.ContactMessageRepository.create(data);
  }

  async getAll(query: Record<string, unknown>): Promise<{
    pagination: IPagination;
    data: IContactMessageDocument[];
    unseen: number;
  }> {
    return this.ContactMessageRepository.getAll(query);
  }

  async getById(id: string): Promise<IContactMessageDocument> {
    return this.ContactMessageRepository.getById(id);
  }

  async delete(id: string): Promise<IContactMessageDocument> {
    return this.ContactMessageRepository.delete(id);
  }

  async markRead(): Promise<UpdateResult> {
    return this.ContactMessageRepository.markRead();
  }
}
