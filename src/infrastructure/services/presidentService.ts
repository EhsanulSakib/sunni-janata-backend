import { IPresident } from "../db/presidentModel";
import { IPresidentRepository } from "../repositories/presidentRepository";


export interface IPresidentService {
  getPresidentQuote(): Promise<IPresident>;
  updatePresidentQuote(id: string, quote: IPresident): Promise<IPresident>;
}

export class PresidentService implements PresidentService {
  PresidentRepository: IPresidentRepository;

  constructor(PresidentRepository: IPresidentRepository) {
    this.PresidentRepository = PresidentRepository;
  }

  async getPresidentQuote(): Promise<IPresident> {
    return await this.PresidentRepository.getPresidentQuote();
  }

  async updatePresidentQuote(id: string, quote: IPresident): Promise<IPresident> {
    return await this.PresidentRepository.updatePresidentQuote(id, quote);
  }
}