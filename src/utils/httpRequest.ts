import  type { Request } from "express";

export const getBody = <T>(req: Request): T => {
  return req.body as T;
};

export const getParams = <T>(req: Request): T => {
  return req.params as unknown as T;
};

export const getQuery = <T>(req: Request): T => {
  return req.query as unknown as T;
};