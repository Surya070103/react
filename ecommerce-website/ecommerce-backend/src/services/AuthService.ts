import "dotenv/config";
import {
  createHmac,
  randomBytes,
  scrypt,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import http from "node:http";
import { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";
import { AuthSession, RegisterInput } from "../types/user";

const SESSION_COOKIE = "shop_easy_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const PASSWORD_KEY_LENGTH = 64;

interface SessionPayload extends AuthSession {
  expiresAt: number;
}

const derivePasswordHash = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, PASSWORD_KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const hash = await derivePasswordHash(password, salt);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
};

const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const [saltHex, hashHex, extra] = storedHash.split(":");
  if (
    extra !== undefined ||
    !saltHex || !/^[\da-f]+$/i.test(saltHex) || saltHex.length % 2 !== 0 ||
    !hashHex || !/^[\da-f]+$/i.test(hashHex) || hashHex.length !== PASSWORD_KEY_LENGTH * 2
  ) {
    return false;
  }
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const candidate = await derivePasswordHash(password, salt);
  return timingSafeEqual(candidate, expected);
};

const publicUser = (user: User): AuthSession => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export class AuthService {
  private readonly adminPasswordHash: Buffer | null;
  private readonly adminSalt: Buffer | null;

  constructor(
    private readonly userRepository: Pick<
      UserRepository,
      "findByEmailForAuth" | "findById" | "create" | "update"
    > = new UserRepository()
  ) {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    this.adminSalt = adminEmail ? Buffer.from(`shop-easy-admin:${adminEmail}`) : null;
    this.adminPasswordHash = adminPassword && this.adminSalt
      ? scryptSync(adminPassword, this.adminSalt, PASSWORD_KEY_LENGTH)
      : null;
  }

  async register(input: RegisterInput): Promise<{ user: AuthSession; token: string }> {
    this.assertAuthSecret();
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    if (!name || name.length > 255 || !email || email.length > 255 || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error("Provide a valid name and email address");
    }
    if (input.role !== "customer") {
      throw new Error("Role must be customer");
    }
    if (email === process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
      throw new Error("An account with this email already exists");
    }
    if (typeof input.password !== "string" || input.password.length < 8 || input.password.length > 256) {
      throw new Error("Password must contain 8 to 256 characters");
    }
    if (!Number.isSafeInteger(input.phoneno) || input.phoneno <= 0) {
      throw new Error("Provide a valid phone number");
    }

    const existing = await this.userRepository.findByEmailForAuth(email);
    if (existing) throw new Error("An account with this email already exists");

    const user = await this.userRepository.create({
      name,
      email,
      phoneno: input.phoneno,
      role: input.role,
      passwordHash: await hashPassword(input.password),
    });
    const sessionUser = publicUser(user);
    return { user: sessionUser, token: this.createToken(sessionUser) };
  }

  async login(emailInput: unknown, passwordInput: unknown): Promise<{ user: AuthSession; token: string }> {
    this.assertAuthSecret();
    const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";
    const password = typeof passwordInput === "string" ? passwordInput : "";
    if (!email || !password) throw new Error("Email and password are required");

    const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (configuredAdminEmail && email === configuredAdminEmail && this.adminPasswordHash && this.adminSalt) {
      const candidate = await derivePasswordHash(password, this.adminSalt);
      if (timingSafeEqual(candidate, this.adminPasswordHash)) {
        const user: AuthSession = { id: 0, name: "Administrator", email, role: "admin" };
        return { user, token: this.createToken(user) };
      }
      throw new Error("Invalid email or password");
    }

    const user = await this.userRepository.findByEmailForAuth(email);
    const storedPasswordHash = user?.passwordHash;
    if (
      !user ||
      user.status !== "active" ||
      typeof storedPasswordHash !== "string" ||
      !(await verifyPassword(password, storedPasswordHash))
    ) {
      throw new Error("Invalid email or password");
    }

    const sessionUser = publicUser(user);
    return { user: sessionUser, token: this.createToken(sessionUser) };
  }

  async resetCustomerPassword(userId: number, passwordInput: unknown): Promise<void> {
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new Error("Provide a valid customer ID");
    }
    if (typeof passwordInput !== "string" || passwordInput.length < 8 || passwordInput.length > 256) {
      throw new Error("Password must contain 8 to 256 characters");
    }

    const user = await this.userRepository.findById(userId);
    if (
      !user ||
      user.role !== "customer" ||
      user.status !== "active"
    ) {
      throw new Error("Customer account not found");
    }
    await this.userRepository.update(user, { passwordHash: await hashPassword(passwordInput) });
  }

  getSessionUser(req: http.IncomingMessage): AuthSession | null {
    const cookieHeader = req.headers.cookie ?? "";
    const cookies = new Map(cookieHeader.split(";").map((part) => {
      const separator = part.indexOf("=");
      return separator < 0
        ? [part.trim(), ""]
        : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
    }));
    const authorization = req.headers.authorization;
    const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    const token = cookies.get(SESSION_COOKIE) || bearer;
    if (!token) return null;

    try {
      const [encodedPayload, signature, extra] = token.split(".");
      if (!encodedPayload || !signature || extra) return null;
      const expectedSignature = this.sign(encodedPayload);
      const received = Buffer.from(signature);
      const expected = Buffer.from(expectedSignature);
      if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
      const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
      if (
        !Number.isSafeInteger(payload.id) ||
        typeof payload.name !== "string" ||
        typeof payload.email !== "string" ||
        !["customer", "admin"].includes(payload.role) ||
        !Number.isSafeInteger(payload.expiresAt) ||
        payload.expiresAt <= Math.floor(Date.now() / 1000)
      ) {
        return null;
      }
      return { id: payload.id, name: payload.name, email: payload.email, role: payload.role };
    } catch {
      return null;
    }
  }

  async authenticate(req: http.IncomingMessage): Promise<AuthSession | null> {
    const session = this.getSessionUser(req);
    if (!session || session.role === "admin") return session;
    const user = await this.userRepository.findById(session.id);
    if (
      !user ||
      user.status !== "active" ||
      user.role !== session.role ||
      user.email !== session.email
    ) {
      return null;
    }
    return publicUser(user);
  }

  sessionCookie(token: string): string {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
  }

  clearSessionCookie(): string {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
  }

  private createToken(user: AuthSession): string {
    const payload: SessionPayload = {
      ...user,
      expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${encoded}.${this.sign(encoded)}`;
  }

  private sign(value: string): string {
    return createHmac("sha256", this.getAuthSecret()).update(value).digest("base64url");
  }

  private assertAuthSecret(): void {
    this.getAuthSecret();
  }

  private getAuthSecret(): string {
    const secret = process.env.AUTH_SECRET;
    if (!secret || Buffer.byteLength(secret) < 32) {
      throw new Error("AUTH_SECRET must contain at least 32 characters");
    }
    return secret;
  }
}
