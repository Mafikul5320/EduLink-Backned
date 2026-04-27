import { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";

function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let message = "Internal Server Error";


  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided. Please check your request body.";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2000":
        statusCode = 400;
        message = "The provided value is too long for one of the fields.";
        break;
      case "P2002":
        statusCode = 409;
        message = `Duplicate entry: A record with this value already exists.`;
        break;
      case "P2003":
        statusCode = 400;
        message = "Invalid reference: Related record not found.";
        break;
      case "P2025":
        statusCode = 404;
        message = "Record not found.";
        break;
      default:
        statusCode = 400;
        message = `Database error occurred (Code: ${err.code}).`;
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    message = "Database connection failed. Please try again later.";
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    message = "An unexpected database error occurred.";
  }


  else if (err instanceof Error) {
    message = err.message;

    if ("statusCode" in err && typeof (err as any).statusCode === "number") {
      statusCode = (err as any).statusCode;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      error: err instanceof Error ? err.stack : err,
    }),
  });
}

export default globalErrorHandler;
