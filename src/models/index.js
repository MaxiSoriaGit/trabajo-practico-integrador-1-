// ============================================================
// UNICO lugar donde se definen las relaciones y los hooks.
// Todo el resto del proyecto importa los modelos desde aca:
//   import { UserModel, ArticleModel } from "../models/index.js";
// ============================================================
import { UserModel } from "./user.model.js";
import { ProfileModel } from "./profile.model.js";
import { ArticleModel } from "./article.model.js";
import { TagModel } from "./tag.model.js";
import { ArticleTagModel } from "./articleTag.model.js";

// ---------- 1:1  User <-> Profile ----------
// La FK (user_id) vive en la tabla del lado "belongsTo" (Profile).
UserModel.hasOne(ProfileModel, { foreignKey: "user_id", as: "profile" });
ProfileModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });

// ---------- 1:N  User -> Article ----------
// Un usuario tiene muchos articulos; cada articulo pertenece a un usuario.
UserModel.hasMany(ArticleModel, { foreignKey: "user_id", as: "articles" });
ArticleModel.belongsTo(UserModel, { foreignKey: "user_id", as: "author" });

// ---------- N:M  Article <-> Tag (tabla intermedia ArticleTag) ----------
// foreignKey = columna de la intermedia que apunta a ESTE modelo
// otherKey   = columna de la intermedia que apunta al OTRO modelo
ArticleModel.belongsToMany(TagModel, {
    through: ArticleTagModel,
    foreignKey: "article_id",
    otherKey: "tag_id",
    as: "tags",
});
TagModel.belongsToMany(ArticleModel, {
    through: ArticleTagModel,
    foreignKey: "tag_id",
    otherKey: "article_id",
    as: "articles",
});

// ---------- Hooks: eliminacion en cascada de la intermedia ----------
ArticleModel.beforeDestroy(async (article) => {
    await ArticleTagModel.destroy({ where: { article_id: article.id } });
});
TagModel.beforeDestroy(async (tag) => {
    await ArticleTagModel.destroy({ where: { tag_id: tag.id } });
});

export { UserModel, ProfileModel, ArticleModel, TagModel, ArticleTagModel };
