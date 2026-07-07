import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export class ResponseHandler {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message: string, errors?: any, statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static internalError(res: Response, error: any) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected server error occurred.",
      errors: process.env.NODE_ENV === "development" ? error.message || error : undefined,
    });
  }
}
