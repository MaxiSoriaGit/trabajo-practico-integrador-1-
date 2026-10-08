import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const UserModel = sequelize.define(
    "User",
    {
        username: { type: DataTypes.STRING(20), allowNull: false, unique: true },
        email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        password: { type: DataTypes.STRING(255), allowNull: false },
        role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
    },
    {
        tableName: "Users",
        paranoid: true, // eliminacion logica -> agrega deletedAt
    }
);
