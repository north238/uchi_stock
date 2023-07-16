import { Request, Response, NextFunction, RequestHandler } from 'express';

export const catchAsync = <T extends RequestHandler>(func: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
