import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const TagModel = sequelize.define(
    "Tag",
    {
        name: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    },
    { tableName: "Tags" }
);
