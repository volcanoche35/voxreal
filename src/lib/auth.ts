import * as jwt from "jsonwebtoken"
import * as bcrypt from "bcryptjs"

const SECRET = process.env.AUTH_SECRET || "dev-fallback-secret"

export interface JwtPayload {
  id: string
  email: string
  name?: string | null
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  })
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, SECRET, { algorithms: ["HS256"] }) as JwtPayload
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
