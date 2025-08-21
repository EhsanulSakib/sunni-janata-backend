import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import AppError from '../../../shared/errors/app_errors';

// Extend the Request interface to include the 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  // add more fields as needed
}



export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authorization header missing or malformed");
  }

  const token = authHeader.split(' ')[1];


  const secret = process.env.JWT_SECRET || 'secret'; // ensure you load from .env

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded; // Extend Request type to fix TS error
    // console.log(req.user);
    next();
  } catch (err) {
    next(err);
  }
};
