import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./src/models/index.js"; // registra modelos + relaciones antes de sincronizar la BD
import { startDB } from "./src/config/database.js";
import { authRouter } from "./src/routes/auth.routes.js";
import { userRouter } from "./src/routes/user.routes.js";
import { tagRouter } from "./src/routes/tag.routes.js";
import { articleRouter } from "./src/routes/article.routes.js";
import { articleTagRouter } from "./src/routes/articleTag.routes.js";
import { notFoundHandler, errorHandler } from "./src/middlewares/error.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", tagRouter);
app.use("/api", articleRouter);
app.use("/api", articleTagRouter);

// Siempre al final, despues de todas las rutas
app.use(notFoundHandler);
app.use(errorHandler);

try {
    await startDB();
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
} catch (error) {
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exit(1);
}
