import jwt from "jsonwebtoken";

export function signAccessToken(payload: object) {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessToken(token: string) {
  const secret = process.env.JWT_SECRET!;
  return jwt.verify(token, secret) as any;
}
