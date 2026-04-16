import { NextFunction, Request, Response } from "express";

function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    success: false,
    message: `Route Not Found: ${req.method} ${req.originalUrl}`,
  });
}

export default notFound;
