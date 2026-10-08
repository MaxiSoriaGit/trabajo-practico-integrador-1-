# Blog Personal API v2 — Trabajo Práctico Integrador I

API REST de un blog personal con autenticación por cookies HTTP-only (JWT), autorización por roles y relaciones **1:1**, **1:N** y **N:M**. Construida con Node.js, Express 5 y Sequelize sobre MySQL.

> Versión mejorada del TP original. Misma estructura de capas (rutas → middlewares → controladores → modelos), pero con relaciones centralizadas, mejores validaciones y mejor manejo de errores. Ver [Mejoras respecto a la v1](#mejoras-respecto-a-la-v1).

## Stack

Node.js 18+ (ES Modules) · Express 5 · Sequelize 6 + mysql2 · jsonwebtoken · bcrypt · express-validator · cookie-parser · cors · dotenv

## Estructura del proyecto

```
blog-api-v2/
├── app.js                          # Punto de entrada: middlewares globales, rutas, errores, listen
├── package.json
├── package-lock.json
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore
├── README.md
├── scripts/
│   └── seed-admin.js               # Crea el usuario admin (npm run seed:admin)
├── postman/
│   ├── Blog-API.postman_collection.json
│   └── Blog-Local.postman_environment.json
└── src/
    ├── config/
    │   └── database.js             # Conexión Sequelize + sync
    ├── models/
    │   ├── index.js                # ⭐ TODAS las relaciones y hooks viven acá
    │   ├── user.model.js
    │   ├── profile.model.js
    │   ├── article.model.js
    │   ├── tag.model.js
    │   └── articleTag.model.js     # Tabla intermedia N:M
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── user.controller.js
    │   ├── tag.controller.js
    │   ├── article.controller.js
    │   └── articleTag.controller.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── tag.routes.js
    │   ├── article.routes.js
    │   └── articleTag.routes.js
    ├── middlewares/
    │   ├── validate.js             # Corta con 400 si falló express-validator
    │   ├── auth.middleware.js      # JWT de la cookie -> req.user
    │   ├── admin.middleware.js     # Solo rol admin
    │   ├── owner.middleware.js     # Dueño del artículo o admin -> req.article
    │   ├── error.middleware.js     # 404 de rutas y handler global de errores
    │   └── validations/
    │       ├── auth.validation.js
    │       ├── user.validation.js
    │       ├── tag.validation.js
    │       ├── article.validation.js
    │       └── articleTag.validation.js
    └── helpers/
        ├── jwt.helper.js
        └── bcrypt.helper.js
```

## Modelo de datos

| Relación | Tipo | Cómo se implementa |
|---|---|---|
| User ↔ Profile | 1:1 | `Profile.user_id` con `unique: true` |
| User → Article | 1:N | `Article.user_id` (sin `unique`) |
| Article ↔ Tag | N:M | Tabla intermedia `ArticlesTags` (`article_id`, `tag_id`) |

Eliminación lógica (`paranoid: true`) en `User` y `Article`. Al borrar un artículo o una etiqueta, un hook elimina sus filas de `ArticlesTags`.

## Setup paso a paso

**Requisitos:** Node.js 18 o superior, MySQL en ejecución y Git.

1. **Cloná el repositorio** (o usá tu carpeta local):
   ```bash
   git clone https://github.com/TU_USUARIO/blog-api-v2.git
   cd blog-api-v2
   ```
2. **Instalá las dependencias:**
   ```bash
   npm install
   ```
3. **Creá la base de datos** en MySQL (el nombre debe coincidir con `DB_NAME`):
   ```sql
   CREATE DATABASE blog_db;
   ```
4. **Configurá las variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   Abrí `.env` y completá `DB_PASSWORD` y `JWT_SECRET` (una cadena larga y aleatoria).
5. **Levantá el servidor** (crea las tablas automáticamente al iniciar):
   ```bash
   npm run dev
   ```
   Deberías ver `Conexion a la base de datos establecida correctamente.` y `Servidor corriendo en http://localhost:3000`.
6. **Creá el usuario administrador** (en otra terminal, con el servidor ya levantado una vez):
   ```bash
   npm run seed:admin
   ```
   Crea `admin@test.com` / `Admin1234` (configurable con `ADMIN_*` en `.env`).
7. **Verificá que responde:** `GET http://localhost:3000/api/health` → `{"status":"ok"}`.

## Inicializacion del proyecto

_npm init -y
_npm install express sequelize mysql2 jsonwebtoken bcrypt express-validator cookie-parser cors dotenv

para terminar:
_git checkout main
_git merge --no-ff develop -m "release: v1.0.0"
## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | *(vacío o la tuya)* |
| `DB_NAME` | Nombre de la base de datos | `blog_db` |
| `DB_SYNC_ALTER` | `true`: ajusta tablas a los modelos al iniciar. `false`: solo crea las que faltan | `true` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | `production` activa la cookie `secure` | `development` |
| `JWT_SECRET` | Secreto para firmar los JWT | *(cadena larga y aleatoria)* |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Datos del admin que crea `seed:admin` | `admin` / `admin@test.com` / `Admin1234` |

## Endpoints

Todas las rutas cuelgan de `/api`. Salvo registro y login, **todas requieren sesión** (cookie `token`).

### Auth

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/auth/register` | Registra usuario + perfil | Público |
| POST | `/auth/login` | Inicia sesión (setea cookie) | Público |
| GET | `/auth/profile` | Usuario logueado + perfil | Autenticado |
| PUT | `/auth/profile` | Actualiza el perfil propio | Autenticado |
| POST | `/auth/logout` | Cierra sesión | Autenticado |

### Users

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/users` | Lista usuarios | Admin |
| GET | `/users/:id` | Usuario con perfil y artículos | Admin |
| POST | `/users` | Crea usuario (con rol) | Admin |
| PUT | `/users/:id` | Actualiza usuario (hashea password si viene) | Admin |
| DELETE | `/users/:id` | Soft delete (no podés borrarte a vos mismo) | Admin |

### Tags

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/tags` | Crea etiqueta | Admin |
| GET | `/tags` | Lista etiquetas | Autenticado |
| GET | `/tags/:id` | Etiqueta con sus artículos publicados | Admin |
| PUT | `/tags/:id` | Actualiza etiqueta | Admin |
| DELETE | `/tags/:id` | Elimina etiqueta y sus relaciones | Admin |

### Articles

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/articles` | Crea artículo | Autenticado |
| GET | `/articles` | Lista artículos publicados (con autor y tags) | Autenticado |
| GET | `/articles/user` | Mis artículos (publicados y archivados) | Autenticado |
| GET | `/articles/user/:id` | Uno de mis artículos | Autenticado |
| GET | `/articles/:id` | Un artículo (archivado: solo dueño/admin) | Autenticado |
| PUT | `/articles/:id` | Actualiza artículo | Dueño o admin |
| DELETE | `/articles/:id` | Soft delete + limpia relaciones | Dueño o admin |

### Article-Tags (N:M)

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/articles-tags` | Asocia etiqueta a artículo (`409` si ya existe) | Dueño del artículo o admin |
| DELETE | `/articles-tags/:articleTagId` | Quita la etiqueta del artículo | Dueño del artículo o admin |

> **¿De dónde saco `articleTagId`?** Al hacer `GET /articles` cada tag trae `ArticleTag.id`. También lo devuelve el `POST /articles-tags`.

### Formato de errores

| Código | Cuándo |
|---|---|
| 400 | Validación fallida (array de mensajes `campo: mensaje`), JSON inválido, duplicado de email/username |
| 401 | Sin cookie, token inválido/expirado, usuario eliminado |
| 403 | Rol o dueño incorrecto |
| 404 | Recurso o ruta inexistente |
| 409 | Duplicado de etiqueta o relación artículo-etiqueta |
| 500 | Error interno |

---

## Probar la API en Postman

En la carpeta `postman/` hay dos archivos listos para importar.

### Importar
1. Postman → **Import** → arrastrá `Blog-API.postman_collection.json` y `Blog-Local.postman_environment.json`.
2. Arriba a la derecha elegí el environment **Blog API - Local** (define `base_url`, credenciales del admin y la password de prueba).
3. Asegurate de haber corrido `npm run seed:admin`.

### Cómo funciona la sesión
El login setea una cookie HTTP-only llamada `token`. Postman la guarda en su *cookie jar* y la envía sola en cada request. **No hay que copiar tokens.** Para cambiar de usuario, simplemente ejecutá otro login (la cookie se reemplaza).

### Correr todo de una
Click derecho en la colección → **Run collection** → **Run**. Se ejecutan 47 requests en orden con tests automáticos (status esperado). Cada corrida genera usuarios/tags con nombres únicos, así que se puede repetir.

### Flujo manual recomendado (para entender cada pieza)
| # | Request | Esperado | Qué demuestra |
|---|---|---|---|
| 1 | Register | 201 | Alta de usuario + perfil (1:1) |
| 2 | Register duplicado | 400 | Validación de unicidad |
| 3 | Register inválido | 400 | Mensajes de express-validator |
| 4 | Login usuario | 200 | Cookie `token` |
| 5 | Get profile | 200 | `include` del perfil, sin password |
| 6 | Crear tag como user | 403 | `adminMiddleware` |
| 7 | Login admin → Crear tag | 201 | Rol admin |
| 8 | Crear tag repetido | 409 | Duplicados |
| 9 | Login usuario → Crear artículo | 201 | `user_id` sale del token (1:N) |
| 10 | Asociar tag al artículo | 201 | Fila en tabla intermedia (N:M) |
| 11 | Asociar de nuevo | 409 | Par único (article_id, tag_id) |
| 12 | GET /articles/:id | 200 | Artículo con `tags` y `ArticleTag.id` |
| 13 | Quitar tag | 200 | Borrado de la fila intermedia |
| 14 | Eliminar artículo → GET | 200 → 404 | Soft delete + cascada |
| 15 | Logout → Get profile | 200 → 401 | Cookie limpiada |

### Ejemplos de bodies

```jsonc
// POST /auth/register
{ "username": "maxi01", "email": "maxi@test.com", "password": "Password1", "first_name": "Maximiliano", "last_name": "Soria" }

// POST /auth/login
{ "email": "maxi@test.com", "password": "Password1" }

// POST /articles   (content: mínimo 50 caracteres)
{ "title": "Mi primer artículo", "content": "Contenido con más de cincuenta caracteres para pasar la validación.", "status": "published" }

// POST /articles-tags
{ "article_id": 1, "tag_id": 1 }
```

### Problemas frecuentes en Postman
- **401 "No autenticado"** → no hiciste login, o la cookie expiró (5 h). Volvé a loguearte.
- **403 inesperado** → estás logueado con el usuario equivocado (user vs admin).
- **No se guarda la cookie** → revisá que la URL sea `localhost` y que no tengas el cookie jar bloqueado en *Settings → Cookies*.

---

## Flujo de trabajo con Git

Ramas: `main` (estable) ← `develop` (integración) ← `feature/*` (una por funcionalidad). Todo se integra con merges `--no-ff` para que quede visible la historia.

### Comandos exactos (ejecutalos dentro de la carpeta del proyecto)

```bash
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
git remote add origin https://github.com/TU_USUARIO/blog-api-v2.git
git push -u origin main
git push -u origin develop
git push origin v2.0.0
```

### Comandos que conviene tener en la cabeza para el parcial
```bash
git status                      # qué cambió
git add .                       # agrega todo (revisá antes con git status que no entre .env)
git commit -m "feat: ..."       # commit
git checkout -b feature/algo    # crear y cambiar de rama
git checkout develop            # cambiar de rama
git merge --no-ff feature/algo  # integrar manteniendo la historia
git log --oneline --graph --all # ver el grafo de ramas
git branch -d feature/algo      # borrar rama ya integrada
git restore --staged archivo    # sacar un archivo del staging
git commit --amend -m "nuevo"   # corregir el último commit (antes de pushear)
```
Convención de mensajes: `feat:` funcionalidad nueva · `fix:` corrección · `docs:` documentación · `refactor:` reorganizar sin cambiar comportamiento · `chore:` configuración/dependencias.

---

## 🎯 Tips clave para el parcial

### 1. Entender la tabla intermedia (N:M) en 60 segundos
Un artículo puede tener **muchas** etiquetas y una etiqueta puede estar en **muchos** artículos. Una columna no alcanza para guardar eso, así que se crea una tabla en el medio donde **cada fila es un vínculo**:

```
Articles            ArticlesTags                 Tags
id | title          id | article_id | tag_id     id | name
1  | Node           1  | 1          | 1          1  | backend
2  | Express        2  | 1          | 2          2  | js
                    3  | 2          | 1
```
Código mínimo para cualquier N:M (reemplazá los nombres):
```js
// 1) la tabla intermedia, con id EXPLÍCITO y las dos FK
const ArticleTagModel = sequelize.define("ArticleTag", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    article_id: { type: DataTypes.INTEGER, allowNull: false },
    tag_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "ArticlesTags" });

// 2) las dos asociaciones (en models/index.js)
ArticleModel.belongsToMany(TagModel, { through: ArticleTagModel, foreignKey: "article_id", otherKey: "tag_id", as: "tags" });
TagModel.belongsToMany(ArticleModel, { through: ArticleTagModel, foreignKey: "tag_id", otherKey: "article_id", as: "articles" });
```
Regla para no confundirte: **`foreignKey` = la columna que apunta al modelo desde el que escribís**, `otherKey` = la que apunta al otro.

### 2. Cómo decidir el tipo de relación
| Si la frase es… | Relación | Dónde va la FK |
|---|---|---|
| "Un X tiene un solo Y y viceversa" | 1:1 | En uno de los dos, con `unique: true` |
| "Un X tiene muchos Y, un Y es de un solo X" | 1:N | En la tabla del "muchos" (Y) |
| "Un X tiene muchos Y y un Y está en muchos X" | N:M | En una tabla intermedia nueva |

### 3. Receta para adaptar el proyecto a otras entidades (ej.: Estudiante ↔ Curso)
1. Escribí en papel las entidades y la frase de cada relación (ver tabla de arriba).
2. Copiá `tag.model.js` → `course.model.js` y ajustá los campos. Copiá `articleTag.model.js` → `enrollment.model.js` (la intermedia).
3. En `src/models/index.js` declará las asociaciones y exportá los modelos nuevos.
4. Copiá `tag.validation.js`, `tag.controller.js` y `tag.routes.js` renombrando (CRUD de la entidad simple).
5. Copiá `articleTag.*` → `enrollment.*` (alta/baja de la relación) y cambiá `article_id`/`tag_id` por tus FK.
6. Si te piden eliminación lógica: `paranoid: true` en el modelo. Si piden cascada: hook `beforeDestroy` en `models/index.js`.
7. Montá el router nuevo en `app.js` (`app.use("/api", courseRouter)`).
8. Probá en Postman: crear → listar → relacionar → ver con `include` → borrar.

> Tip: **buscá y reemplazá** (`Ctrl+Shift+H` en VS Code) `Article`→`Student`, `Tag`→`Course`, `article`→`student`, `tag`→`course`. Después revisá a mano campos y mensajes.

### 4. Orden de middlewares (siempre el mismo)
```
authMiddleware → adminMiddleware / ownerMiddleware → validaciones → validate → controller
```
- Rutas fijas antes que rutas con parámetro: `/articles/user` **antes** de `/articles/:id`.
- `matchedData(req)` devuelve **solo** lo validado: protege contra mass assignment (por ejemplo, que alguien se mande `role: "admin"` al registrarse).
- `user_id` del artículo sale de `req.user.id` (el token), **nunca** del body.

### 5. Cheatsheet de Sequelize
```js
Model.create({ ... })                          // INSERT
Model.findAll({ where, include, order })       // SELECT *
Model.findByPk(id, { include })                // SELECT por id
Model.findOne({ where: { email } })            // primer match
instance.update({ ... })                       // UPDATE
instance.destroy()                             // DELETE (soft si paranoid: true)
Model.findOne({ where, paranoid: false })      // incluye eliminados lógicamente
include: [{ model: TagModel, as: "tags" }]     // JOIN (el "as" debe coincidir con la asociación)
include: [{ ..., through: { attributes: [] } }]// oculta columnas de la intermedia
```

### 6. Errores típicos y su causa
| Síntoma | Causa probable |
|---|---|
| `Cannot read properties of undefined (reading 'cookies')` | Falta `app.use(cookieParser())` o está después de las rutas |
| `req.body` vacío | Falta `app.use(express.json())` antes de las rutas, o en Postman el body no es *raw → JSON* |
| `SequelizeEagerLoadingError: X is not associated to Y` | Falta la asociación, o el `as` del `include` no coincide con el de `models/index.js` |
| `... is not associated` justo después de agregar un modelo | No se importó el modelo nuevo en `models/index.js` |
| `Unknown column 'xyz' in 'field list'` | Cambiaste un modelo y la tabla no se actualizó: `DB_SYNC_ALTER=true` (o borrá la tabla en desarrollo) |
| `/articles/user` devuelve 400 "id debe ser entero" | La ruta `/articles/:id` está declarada antes que `/articles/user` |
| `Too many keys specified; max 64 keys` | `sync({ alter: true }) ` acumuló índices duplicados: dropeá la BD y recreala, y poné `DB_SYNC_ALTER=false` |
| `ERR_MODULE_NOT_FOUND` | Falta la extensión `.js` en un import (en ESM es obligatoria) |
| Siempre 401 | Cookie no enviada (Postman: ¿hiciste login?) o `JWT_SECRET` distinto al que firmó el token |
| `Data too long for column` | Valor más largo que `STRING(n)` del modelo |

### 7. Estrategia para el día del examen
1. **Leé el enunciado entero** y dibujá las entidades y relaciones antes de tocar código.
2. Arrancá copiando el repo y creá la BD nueva. `npm install`, `.env`, `npm run dev`: verificá que levanta **antes** de cambiar nada.
3. Orden sugerido: modelos + relaciones → auth → CRUD simple → CRUD con permisos → relación N:M → pruebas.
4. Probá **cada endpoint apenas lo terminás** (no al final).
5. Commit chico y frecuente en una rama `feature/...`; al terminar, merge a `develop` y a `main`.
6. Última pasada: `.env` no versionado, `.env.example` actualizado, README con endpoints nuevos.

### 8. Checklist final antes de entregar
- [ ] `git status` limpio y `.env` ignorado
- [ ] El proyecto levanta desde cero (`npm install` + `npm run dev`)
- [ ] Todos los endpoints responden con el status correcto (200/201/400/401/403/404/409)
- [ ] Contraseñas hasheadas y nunca devueltas en las respuestas
- [ ] Soft delete y cascada funcionando
- [ ] Ramas `main` y `develop` actualizadas y subidas

---

## Mejoras respecto a la v1

- **Relaciones centralizadas** en `src/models/index.js`: no depende del orden de imports y se ven las tres relaciones juntas.
- **`ArticleTag` con `id` explícito**: sin esto Sequelize lo elimina y usa clave compuesta, y `DELETE /articles-tags/:id` no tendría qué borrar.
- **Par `(article_id, tag_id)` único** en la BD y `409` si se intenta duplicar.
- **Admin puede quitar etiquetas** (antes solo podía el dueño, aunque sí podía agregarlas).
- **Hook de cascada también en `Tag`**: antes, al borrar una etiqueta quedaban filas huérfanas en la intermedia.
- **`authMiddleware` consulta la BD**: un usuario eliminado o con otro rol no puede seguir usando un token viejo.
- **Duplicados contra usuarios eliminados**: email/username de un usuario borrado lógicamente siguen ocupados (evita un `500` por la restricción `unique`).
- **`PUT /users/:id`**: valida duplicados, permite cambiar la password (hasheada) y un admin no puede borrarse a sí mismo.
- **IDs normalizados** con `.toInt()` en las validaciones de params.
- **Artículos archivados** solo visibles para dueño/admin; `/articles/user` devuelve también los archivados propios.
- **Manejo global de errores**: `404` para rutas inexistentes y `400` para JSON mal formado.
- **Cookie** con `sameSite: "lax"` y `secure` en producción; `cors` con credenciales.
- **`startDB` corta el arranque** si la BD falla, y `DB_SYNC_ALTER` controla `alter`.
- **`npm run seed:admin`** reemplaza el `UPDATE` manual en SQL.
- **Colección de Postman** con 47 requests y tests automáticos.

## Autor

Maximiliano Soria — Instituto Politécnico Formosa — Tecnicatura Superior en Desarrollo de Software Multiplataforma · GitHub: [@MaxiSoriaGit](https://github.com/MaxiSoriaGit)
