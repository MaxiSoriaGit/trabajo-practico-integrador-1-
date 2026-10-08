import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ArticleModel = sequelize.define(
    "Article",
    {
        title: { type: DataTypes.STRING(200), allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false },
        excerpt: { type: DataTypes.STRING(500), allowNull: true },
        status: {
            type: DataTypes.ENUM("published", "archived"),
            defaultValue: "published",
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false, // sin unique => un usuario puede tener muchos articulos (1:N)
            references: { model: "Users", key: "id" },
        },
    },
    {
        tableName: "Articles",
        paranoid: true, // eliminacion logica del articulo
    }
);
