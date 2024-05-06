import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

export class ErrorMidleware {
  static MulterErrorMiddleware(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (error instanceof MulterError) {
      res.status(400).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: error.message,
      });
    }
  }
}
