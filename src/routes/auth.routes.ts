import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { signupSchema, loginSchema } from "../validators/auth.schema";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), signup);
authRouter.post("/login", validateBody(loginSchema), login);
