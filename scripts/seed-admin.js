// Crea (o promueve) un usuario administrador. Uso: npm run seed:admin
import "dotenv/config";
import { sequelize } from "../src/config/database.js";
import { UserModel, ProfileModel } from "../src/models/index.js";
import { hashPassword } from "../src/helpers/bcrypt.helper.js";

const username = process.env.ADMIN_USERNAME || "admin";
const email = process.env.ADMIN_EMAIL || "admin@test.com";
const password = process.env.ADMIN_PASSWORD || "Admin1234";

try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existing = await UserModel.findOne({ where: { email }, paranoid: false });

    if (existing) {
        if (existing.deletedAt) await existing.restore();
        await existing.update({ role: "admin" });
        console.log(`El usuario ${email} ya existia: ahora es admin.`);
    } else {
        const user = await UserModel.create({
            username,
            email,
            password: await hashPassword(password),
            role: "admin",
        });
        await ProfileModel.create({ user_id: user.id, first_name: "Admin", last_name: "Sistema" });
        console.log(`Admin creado -> email: ${email} | password: ${password}`);
    }
} catch (error) {
    console.error("No se pudo crear el admin:", error.message);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
