import { AppError } from "./AppError.ts";

export const throwError = (error: {
  message: string;
  status: number;
  code: string;
}) => {
  throw new AppError(error);
};