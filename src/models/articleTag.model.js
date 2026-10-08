import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// Tabla intermedia de la relacion N:M entre Article y Tag.
// Cada fila = "este articulo tiene esta etiqueta".
export const ArticleTagModel = sequelize.define(
    "ArticleTag",
    {
        // id EXPLICITO: si no lo declaras, belongsToMany lo elimina y usa (article_id, tag_id)
        // como clave primaria compuesta, y DELETE /articles-tags/:articleTagId no tendria id.
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        article_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Articles", key: "id" },
        },
        tag_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Tags", key: "id" },
        },
    },
    {
        tableName: "ArticlesTags",
        // evita a nivel BD que se repita el mismo par (articulo, etiqueta)
        indexes: [{ unique: true, name: "unique_article_tag", fields: ["article_id", "tag_id"] }],
    }
);
