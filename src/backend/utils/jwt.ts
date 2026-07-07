import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET || "enterprise_secure_access_token_secret_key";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "enterprise_secure_refresh_token_secret_key";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshPayload {
  userId: string;
  sessionId: string;
}

export class TokenService {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
  }

  static generateRefreshToken(payload: RefreshPayload): string {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): RefreshPayload {
    return jwt.verify(token, REFRESH_SECRET) as RefreshPayload;
  }
}
