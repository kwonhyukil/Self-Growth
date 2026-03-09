import { Router } from "express";
import { login, signup } from "./auth.controller";
import { validateBody } from "../../shared/http/validate.middleware";
import { signupSchema, loginSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), signup);
authRouter.post("/login", validateBody(loginSchema), login);
