import { Router } from "express";
import { login, me, signup } from "./auth.controller";
import { validateBody } from "../../shared/http/validate.middleware";
import { signupSchema, loginSchema } from "./auth.schema";
import { authMiddleware } from "../../shared/http/auth.middleware";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), signup);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.get("/me", authMiddleware, me);
