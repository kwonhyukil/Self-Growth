import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_later";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "3600";

export type AccessTokenPayload = {
  userId: number;
};

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: Number(JWT_EXPIRES_IN) });
}
