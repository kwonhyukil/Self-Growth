import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma";
import { signAccessToken } from "../utils/jwt";

type SignupInput = {
  email: string;
  password: string;
  name: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export const authService = {
  async signup(input: SignupInput) {
    const { email, password, name } = input;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      const e: any = new Error("이미 사용중인 이메일입니다.");
      e.status = 409;
      e.code = "EMAIL_ALREADY_EXISTS";
      throw e;
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashed,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
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

    // 이메일 비일치 (메시지는 똑같이)
    if (!user) {
      const e: any = new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
      e.status = 401;
      e.code = "INVALID_CREDENTIALS";
      throw e;
    }

    // 사용자가 입력한 비밀번호와 해시 비밀번호 확인
    const ok = await bcrypt.compare(password, user.passwordHash);

    // 비밀번호 비일치 (메시지는 똑같이)
    if (!ok) {
      const e: any = new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
      e.status = 401;
      e.code = "INVALID_CREDENTIALS";
      throw e;
    }

    const accessToken = signAccessToken({ userId: user.id });

    // passwordHash는 응답에 미포함
    const { passwordHash, ...safeUser } = user;

    return { user: safeUser, accessToken };
  },
};
