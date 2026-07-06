import type { Request, Response } from "express";
import type { ApiResponse } from "../types/types.ts";
import { toPublicResponse } from "./publicResponse.ts";

const httpResponse = <T>(
  req: Request,
  res: Response,
  status: number,
  message: string,
  data?: T,
  role: string = "user"
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data: toPublicResponse(data),
    requestId: req.requestId,
  };

  return res.status(status).json(response);
};

export default httpResponse;