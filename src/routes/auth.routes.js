import { Router } from "express";
import { register, login, logout, getProfile, updateProfile } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    registerValidation,
    loginValidation,
    updateProfileValidation,
} from "../middlewares/validations/auth.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/auth/register", registerValidation, validate, register);
authRouter.post("/auth/login", loginValidation, validate, login);
authRouter.get("/auth/profile", authMiddleware, getProfile);
authRouter.put("/auth/profile", authMiddleware, updateProfileValidation, validate, updateProfile);
authRouter.post("/auth/logout", authMiddleware, logout);
