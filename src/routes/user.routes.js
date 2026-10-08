import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    createUserValidation,
    updateUserValidation,
    idParamValidation,
} from "../middlewares/validations/user.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

export const userRouter = Router();

// Orden de middlewares: auth -> rol -> validacion -> validate -> controller
userRouter.get("/users", authMiddleware, adminMiddleware, getAllUsers);
userRouter.get("/users/:id", authMiddleware, adminMiddleware, idParamValidation, validate, getUserById);
userRouter.post("/users", authMiddleware, adminMiddleware, createUserValidation, validate, createUser);
userRouter.put("/users/:id", authMiddleware, adminMiddleware, updateUserValidation, validate, updateUser);
userRouter.delete("/users/:id", authMiddleware, adminMiddleware, idParamValidation, validate, deleteUser);
