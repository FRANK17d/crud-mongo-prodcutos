# CRUD de Productos / Products CRUD

Aplicacion con API REST versionada en `Express.js` y `MongoDB Atlas` para gestionar una coleccion de productos, junto con una interfaz web bilingue en `HTML`, `CSS` y `Fetch API`.

Application with a versioned `Express.js` and `MongoDB Atlas` REST API to manage a product collection, plus a bilingual web interface built with `HTML`, `CSS`, and `Fetch API`.

## Caracteristicas / Features

- CRUD completo sobre `productos`
- API versionada en `/api/v1/productos`
- Busqueda por texto con `search`
- Paginacion con `page` y `limit`
- Validaciones con `mongoose`
- Manejo centralizado de errores
- Interfaz responsive con formulario, tabla y acciones de editar/eliminar
- Etiquetas y mensajes en espanol e ingles

## Estructura / Structure

```text
app.js
server.js
src/
  api/v1/
    controllers/
    routes/
  config/
  constants/
  middlewares/
  models/
  public/
  routes/
  utils/
```

## Variables de entorno / Environment variables

1. Copia `.env.example` a `.env`.
2. Configura tu URI de MongoDB Atlas en `MONGODB_URI`.

Example:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/examen4?retryWrites=true&w=majority
```

## Ejecutar / Run

```bash
npm run dev
```

```bash
npm start
```

## Endpoints

- `POST /api/v1/productos`
- `GET /api/v1/productos`
- `GET /api/v1/productos/:id`
- `PUT /api/v1/productos/:id`
- `DELETE /api/v1/productos/:id`

Consulta con paginacion y busqueda / Search and pagination query:

```text
GET /api/v1/productos?search=laptop&categoria=Electrónica&page=1&limit=6
```

## Campos del producto / Product fields

- `nombre`
- `descripcion`
- `precio`
- `stock`
- `categoria`

Categorias permitidas / Allowed categories:

- `Electrónica`
- `Ropa`
- `Alimentos`
