import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type AccessTokenPayload = {
  userId: number;
};

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}
