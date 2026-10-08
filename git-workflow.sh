#!/usr/bin/env bash
# Ejecutar DENTRO de la carpeta del proyecto (blog-api-v2). Reemplaza TU_USUARIO antes de hacer push.
set -e
# 0) Inicializar y primer commit en main
git init -b main
git add .gitignore .env.example package.json package-lock.json
git commit -m "chore: estructura inicial del proyecto y dependencias"

# 1) Crear develop
git checkout -b develop

# 2) feature/modelos
git checkout -b feature/modelos
git add src/config/database.js
git commit -m "feat(db): configuracion de Sequelize y conexion a MySQL"
git add src/models/user.model.js src/models/profile.model.js src/models/article.model.js src/models/tag.model.js src/models/articleTag.model.js
git commit -m "feat(models): modelos User, Profile, Article, Tag y ArticleTag"
git add src/models/index.js
git commit -m "feat(models): relaciones 1:1, 1:N, N:M y hooks de cascada"
git checkout develop
git merge --no-ff feature/modelos -m "merge: feature/modelos en develop"
git branch -d feature/modelos

# 3) feature/auth
git checkout -b feature/auth
git add src/helpers/bcrypt.helper.js src/helpers/jwt.helper.js
git commit -m "feat(helpers): hash de passwords con bcrypt y manejo de JWT"
git add src/middlewares/validate.js src/middlewares/auth.middleware.js
git commit -m "feat(middlewares): validate y authMiddleware"
git add src/middlewares/validations/auth.validation.js src/controllers/auth.controller.js src/routes/auth.routes.js
git commit -m "feat(auth): registro, login, perfil y logout con cookies HTTP-only"
git checkout develop
git merge --no-ff feature/auth -m "merge: feature/auth en develop"
git branch -d feature/auth

# 4) feature/users
git checkout -b feature/users
git add src/middlewares/admin.middleware.js
git commit -m "feat(middlewares): adminMiddleware para rutas de administrador"
git add src/middlewares/validations/user.validation.js src/controllers/user.controller.js src/routes/user.routes.js
git commit -m "feat(users): CRUD de usuarios con soft delete (solo admin)"
git checkout develop
git merge --no-ff feature/users -m "merge: feature/users en develop"
git branch -d feature/users

# 5) feature/tags
git checkout -b feature/tags
git add src/middlewares/validations/tag.validation.js src/controllers/tag.controller.js src/routes/tag.routes.js
git commit -m "feat(tags): CRUD de etiquetas (escritura solo admin)"
git checkout develop
git merge --no-ff feature/tags -m "merge: feature/tags en develop"
git branch -d feature/tags

# 6) feature/articles
git checkout -b feature/articles
git add src/middlewares/owner.middleware.js
git commit -m "feat(middlewares): ownerMiddleware (dueno o admin)"
git add src/middlewares/validations/article.validation.js src/controllers/article.controller.js src/routes/article.routes.js
git commit -m "feat(articles): CRUD de articulos con soft delete y control de dueno"
git checkout develop
git merge --no-ff feature/articles -m "merge: feature/articles en develop"
git branch -d feature/articles

# 7) feature/article-tags
git checkout -b feature/article-tags
git add src/middlewares/validations/articleTag.validation.js src/controllers/articleTag.controller.js src/routes/articleTag.routes.js
git commit -m "feat(article-tags): asociar y quitar etiquetas de un articulo (N:M)"
git checkout develop
git merge --no-ff feature/article-tags -m "merge: feature/article-tags en develop"
git branch -d feature/article-tags

# 8) feature/servidor
git checkout -b feature/servidor
git add src/middlewares/error.middleware.js app.js
git commit -m "feat(app): servidor Express, montaje de rutas y manejo global de errores"
git add scripts/seed-admin.js
git commit -m "feat(scripts): seed para crear el usuario administrador"
git checkout develop
git merge --no-ff feature/servidor -m "merge: feature/servidor en develop"
git branch -d feature/servidor

# 9) feature/docs
git checkout -b feature/docs
git add README.md
git commit -m "docs: README con setup, endpoints y tips para el parcial"
git add postman/
git commit -m "docs: coleccion y environment de Postman"
git checkout develop
git merge --no-ff feature/docs -m "merge: feature/docs en develop"
git branch -d feature/docs

# 10) Release: develop -> main
git checkout main
git merge --no-ff develop -m "release: v2.0.0"
git tag -a v2.0.0 -m "Version 2.0.0"

# 11) Verificar la historia
git log --oneline --graph --all
git branch

# 12) Subir a GitHub (creá antes el repo vacío en github.com)
# git remote add origin https://github.com/TU_USUARIO/blog-api-v2.git
# git push -u origin main
# git push -u origin develop
# git push origin v2.0.0
