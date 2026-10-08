import { Op } from "sequelize";
import { matchedData } from "express-validator";
import { UserModel, ProfileModel, ArticleModel } from "../models/index.js";
import { hashPassword } from "../helpers/bcrypt.helper.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.findAll({
            attributes: { exclude: ["password"] },
            include: [{ model: ProfileModel, as: "profile" }],
        });
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = matchedData(req, { locations: ["params"] });

        const user = await UserModel.findByPk(id, {
            attributes: { exclude: ["password"] },
            include: [
                { model: ProfileModel, as: "profile" },
                { model: ArticleModel, as: "articles" },
            ],
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = matchedData(req);

        const existingEmail = await UserModel.findOne({ where: { email }, paranoid: false });
        if (existingEmail) {
            return res.status(400).json({ message: "El email ya esta registrado" });
        }

        const existingUsername = await UserModel.findOne({ where: { username }, paranoid: false });
        if (existingUsername) {
            return res.status(400).json({ message: "El username ya esta en uso" });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await UserModel.create({ username, email, password: hashedPassword, role });
        await ProfileModel.create({
            user_id: newUser.id,
            first_name: "Sin definir",
            last_name: "Sin definir",
        });

        return res.status(201).json({ message: "Usuario creado correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const updateUser = async (req, res) => {
    try {
        // params + body validados juntos: separamos el id del resto de los cambios
        const { id, ...changes } = matchedData(req);

        const user = await UserModel.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (changes.email) {
            const emailTaken = await UserModel.findOne({
                where: { email: changes.email, id: { [Op.ne]: id } },
                paranoid: false,
            });
            if (emailTaken) {
                return res.status(400).json({ message: "El email ya esta registrado" });
            }
        }

        if (changes.username) {
            const usernameTaken = await UserModel.findOne({
                where: { username: changes.username, id: { [Op.ne]: id } },
                paranoid: false,
            });
            if (usernameTaken) {
                return res.status(400).json({ message: "El username ya esta en uso" });
            }
        }

        if (changes.password) {
            changes.password = await hashPassword(changes.password);
        }

        await user.update(changes);

        return res.status(200).json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = matchedData(req, { locations: ["params"] });

        if (id === req.user.id) {
            return res.status(400).json({ message: "No podes eliminar tu propio usuario" });
        }

        const user = await UserModel.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        await user.destroy(); // eliminacion logica gracias a paranoid: true

        return res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
