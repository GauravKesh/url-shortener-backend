import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      clientIp: string;
    }
  }
}

export const clientIpMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string") {
    req.clientIp = forwarded.split(",")[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    req.clientIp = forwarded[0];
  } else if (req.socket.remoteAddress) {
    req.clientIp = req.socket.remoteAddress;
  } else {
    req.clientIp = req.ip;
  }

  next();
};