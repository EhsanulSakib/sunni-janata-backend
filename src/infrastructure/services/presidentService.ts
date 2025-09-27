import { uploadFileToCloudinary } from "../../shared/utils/cloudinary_file_operations";
import { CloudinaryFolders } from "../../shared/utils/enums";
import { isVideoFile } from "../../shared/utils/helper_functions";
import { IPresident, IPresidentDocument } from "../db/presidentModel";
import { IPresidentRepository } from "../repositories/presidentRepository";

export interface IPresidentService {
  getPresidentQuote(): Promise<IPresident>;
  updatePresidentQuote(
    id: string,
    quote: IPresident,
    image?: Express.Multer.File
  ): Promise<IPresident>;
}

export class PresidentService implements IPresidentService {
  PresidentRepository: IPresidentRepository;

  constructor(PresidentRepository: IPresidentRepository) {
    this.PresidentRepository = PresidentRepository;
  }

  async getPresidentQuote(): Promise<IPresident> {
    return await this.PresidentRepository.getPresidentQuote();
  }

  async updatePresidentQuote(
    id: string,
    quote: IPresident,
    image?: Express.Multer.File
  ): Promise<IPresident> {
    if (image) {
      const url = await uploadFileToCloudinary({
        file: image,
        folder: CloudinaryFolders.President,
        isVideo: isVideoFile(image.originalname),
      });
      quote.image = url;
    }
    // Ensure quote object only contains valid fields
    const updatedQuoteData: IPresident = {
      name: quote.name,
      quote: quote.quote,
      details: quote.details,
      designation: quote.designation,
      image: quote.image || undefined,
    };
    return await this.PresidentRepository.updatePresidentQuote(id, updatedQuoteData);
  }
}