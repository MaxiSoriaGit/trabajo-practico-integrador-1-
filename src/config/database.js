import { Sequelize } from "sequelize";
import "dotenv/config";

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false,
    }
);

// Lanza el error si falla: app.js decide que hacer (cortar el arranque).
export const startDB = async () => {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === "true" });
    console.log("Conexion a la base de datos establecida correctamente.");
};
