import jwt from "jsonwebtoken";

export const generateToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5h" });

// Lanza error si el token es invalido o expiro (lo atrapa authMiddleware).
export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
