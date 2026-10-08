import { matchedData } from "express-validator";
import { UserModel, ProfileModel } from "../models/index.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 5, // 5 horas (igual que el JWT)
};

export const register = async (req, res) => {
    try {
        // matchedData solo devuelve lo validado: un "role" enviado por el cliente se ignora.
        const { username, email, password, first_name, last_name } = matchedData(req);

        // paranoid:false => un usuario eliminado (soft delete) sigue ocupando su email/username
        const existingEmail = await UserModel.findOne({ where: { email }, paranoid: false });
        if (existingEmail) {
            return res.status(400).json({ message: "El email ya esta registrado" });
        }

        const existingUsername = await UserModel.findOne({ where: { username }, paranoid: false });
        if (existingUsername) {
            return res.status(400).json({ message: "El username ya esta en uso" });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await UserModel.create({ username, email, password: hashedPassword });
        await ProfileModel.create({ user_id: newUser.id, first_name, last_name });

        return res.status(201).json({ message: "Usuario registrado correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = matchedData(req);

        const user = await UserModel.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        const validPassword = await comparePassword(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        const token = generateToken({ id: user.id, role: user.role });
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({ message: "Login exitoso" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await UserModel.findByPk(req.user.id, {
            attributes: { exclude: ["password"] },
            include: [{ model: ProfileModel, as: "profile" }],
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

export const updateProfile = async (req, res) => {
    try {
        const validatedData = matchedData(req, { locations: ["body"] });

        if (Object.keys(validatedData).length === 0) {
            return res.status(400).json({ message: "No enviaste ningun campo para actualizar" });
        }

        const profile = await ProfileModel.findOne({ where: { user_id: req.user.id } });
        if (!profile) {
            return res.status(404).json({ message: "Perfil no encontrado" });
        }

        await profile.update(validatedData);

        return res.status(200).json({ message: "Perfil actualizado correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: cookieOptions.secure });
    return res.status(200).json({ message: "Logout exitoso" });
};
