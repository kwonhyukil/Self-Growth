import bcrypt from "bcrypt";
import { prisma } from "../../shared/infra/prisma";
import { signAccessToken } from "../../shared/infra/jwt";
import { AppError } from "../../shared/errors/AppError";
import { SignupInput, LoginInput } from "./auth.schema";

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} as const;

export const authService = {
  async signup(input: SignupInput) {
    const { email, password, name } = input;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new AppError(
        409,
        "EMAIL_ALREADY_EXISTS",
        "이미 사용중인 이메일입니다.",
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashed,
      },
      select: safeUserSelect,
    });

    return { user };
  },
  async login(input: LoginInput) {
    const { email, password } = input;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "이메일 또는 비밀번호가 올바르지 않습니다.",
      );
    }

    // 사용자가 입력한 비밀번호와 해시 비밀번호 확인
    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "이메일 또는 비밀번호가 올바르지 않습니다.",
      );
    }

    const accessToken = signAccessToken({ userId: user.id });

    const { passwordHash, ...safeUser } = user;

    return { user: safeUser, accessToken };
  },
  async me(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
    }

    return { user };
  },
};
