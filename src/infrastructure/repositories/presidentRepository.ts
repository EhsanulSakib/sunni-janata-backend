import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import { IPresident, IPresidentModel } from "../db/presidentModel";

export interface IPresidentRepository {
  updatePresidentQuote(id: string, quote: IPresident): Promise<IPresident>;
  getPresidentQuote(): Promise<IPresident>;
}

export default class PresidentRepository implements IPresidentRepository {
  Model: IPresidentModel;

  constructor(model: IPresidentModel) {
    this.Model = model;
  }
  async getPresidentQuote(): Promise<IPresident> {
    const returnedQuote = await this.Model.findOne().sort({ createdAt: -1 });

    if (!returnedQuote) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `President quote not found`
      );
    }
    return returnedQuote;
  }
  async updatePresidentQuote(id: string, quote: IPresident): Promise<IPresident> {
    const updatedQuote = await this.Model.findByIdAndUpdate(id, quote, {
      new: true,
    })

    if (!updatedQuote) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `President quote with id ${id} not found`
      );
    }
    return updatedQuote;
  }
}