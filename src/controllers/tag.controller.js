import { Op } from "sequelize";
import { matchedData } from "express-validator";
import { TagModel, ArticleModel } from "../models/index.js";

export const createTag = async (req, res) => {
    try {
        const { name } = matchedData(req);

        const existingTag = await TagModel.findOne({ where: { name } });
        if (existingTag) {
            return res.status(409).json({ message: "La etiqueta ya existe" });
        }

        const tag = await TagModel.create({ name });
        return res.status(201).json(tag);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getAllTags = async (req, res) => {
    try {
        const tags = await TagModel.findAll();
        return res.status(200).json(tags);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getTagById = async (req, res) => {
    try {
        const { id } = matchedData(req, { locations: ["params"] });

        const tag = await TagModel.findByPk(id, {
            include: [
                {
                    model: ArticleModel,
                    as: "articles",
                    where: { status: "published" },
                    required: false, // LEFT JOIN: devuelve la etiqueta aunque no tenga articulos
                    through: { attributes: [] }, // oculta los datos de la tabla intermedia
                },
            ],
        });

        if (!tag) {
            return res.status(404).json({ message: "Etiqueta no encontrada" });
        }

        return res.status(200).json(tag);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const updateTag = async (req, res) => {
    try {
        const { id, name } = matchedData(req);

        const tag = await TagModel.findByPk(id);
        if (!tag) {
            return res.status(404).json({ message: "Etiqueta no encontrada" });
        }

        const nameTaken = await TagModel.findOne({ where: { name, id: { [Op.ne]: id } } });
        if (nameTaken) {
            return res.status(409).json({ message: "Ya existe otra etiqueta con ese nombre" });
        }

        await tag.update({ name });

        return res.status(200).json({ message: "Etiqueta actualizada correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const deleteTag = async (req, res) => {
    try {
        const { id } = matchedData(req, { locations: ["params"] });

        const tag = await TagModel.findByPk(id);
        if (!tag) {
            return res.status(404).json({ message: "Etiqueta no encontrada" });
        }

        await tag.destroy(); // el hook beforeDestroy (models/index.js) limpia ArticlesTags

        return res.status(200).json({ message: "Etiqueta eliminada correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
