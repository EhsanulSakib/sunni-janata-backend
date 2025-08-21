import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { error } from 'console';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../shared/errors/app_errors';

export const validateRequest = (DTOClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(DTOClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      throw new AppError(StatusCodes.BAD_REQUEST, errors.toString())
    }
    req.body = dtoInstance;
    next();
  };
};
