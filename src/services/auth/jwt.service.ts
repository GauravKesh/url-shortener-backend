import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import config from "../../config/config.ts";

export const signAccessToken = (payload: any) => {
  return jwt.sign(
    payload,
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiry as SignOptions["expiresIn"],
    }
  );
};

export const signRefreshToken = (payload: any) => {
  return jwt.sign(
    payload,
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiry as SignOptions["expiresIn"],
    }
  );
};