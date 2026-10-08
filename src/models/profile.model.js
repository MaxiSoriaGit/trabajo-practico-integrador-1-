import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ProfileModel = sequelize.define(
    "Profile",
    {
        first_name: { type: DataTypes.STRING(50), allowNull: false },
        last_name: { type: DataTypes.STRING(50), allowNull: false },
        biography: { type: DataTypes.TEXT, allowNull: true },
        avatar_url: { type: DataTypes.STRING(255), allowNull: true },
        birth_date: { type: DataTypes.DATEONLY, allowNull: true },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // unique => relacion 1:1 (un perfil por usuario)
            references: { model: "Users", key: "id" },
        },
    },
    { tableName: "Profiles" }
);
