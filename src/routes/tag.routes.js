import { Router } from "express";
import {
    createTag,
    getAllTags,
    getTagById,
    updateTag,
    deleteTag,
} from "../controllers/tag.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    createTagValidation,
    updateTagValidation,
    idParamValidation,
} from "../middlewares/validations/tag.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

export const tagRouter = Router();

tagRouter.post("/tags", authMiddleware, adminMiddleware, createTagValidation, validate, createTag);
tagRouter.get("/tags", authMiddleware, getAllTags);
tagRouter.get("/tags/:id", authMiddleware, adminMiddleware, idParamValidation, validate, getTagById);
tagRouter.put("/tags/:id", authMiddleware, adminMiddleware, updateTagValidation, validate, updateTag);
tagRouter.delete("/tags/:id", authMiddleware, adminMiddleware, idParamValidation, validate, deleteTag);
