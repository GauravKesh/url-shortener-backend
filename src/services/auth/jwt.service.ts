import jwt, { SignOptions } from "jsonwebtoken";
import config from "../../config/config.ts";

const JWT_ALGORITHM: SignOptions["algorithm"] = "HS256";

export const signAccessToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
  algorithm: config.jwt.algorithm,
    expiresIn: config.jwt.accessExpiry as SignOptions["expiresIn"],
  });
};

export const signRefreshToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
  algorithm: config.jwt.algorithm,
    expiresIn: config.jwt.refreshExpiry as SignOptions["expiresIn"],
  });
};