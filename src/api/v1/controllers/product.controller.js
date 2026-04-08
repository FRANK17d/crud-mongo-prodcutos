import Product from "../../../models/product.model.js";
import { PRODUCT_CATEGORIES } from "../../../constants/product.constants.js";
import { AppError } from "../../../utils/app-error.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 24;

function parsePositiveInteger(value, fallback, message) {
  if (value === undefined) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new AppError(400, message);
  }

  return parsedValue;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createProduct(req, res) {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: "Producto creado correctamente",
    data: product
  });
}

export async function getProducts(req, res) {
  const page = parsePositiveInteger(
    req.query.page,
    DEFAULT_PAGE,
    "La pagina debe ser un numero positivo"
  );
  const limit = parsePositiveInteger(
    req.query.limit,
    DEFAULT_LIMIT,
    "El limite debe ser un numero positivo"
  );

  if (limit > MAX_LIMIT) {
    throw new AppError(400, `El limite maximo es ${MAX_LIMIT}`);
  }

  const search = req.query.search?.trim() || "";
  const categoria = req.query.categoria?.trim() || "";
  const filters = {};

  if (categoria) {
    if (!PRODUCT_CATEGORIES.includes(categoria)) {
      throw new AppError(400, "La categoria del filtro no es valida");
    }

    filters.categoria = categoria;
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filters.$or = [{ nombre: regex }, { descripcion: regex }, { categoria: regex }];
  }

  const totalItems = await Product.countDocuments(filters);
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);
  const currentPage = Math.min(page, totalPages);
  const skip = (currentPage - 1) * limit;
  const products = await Product.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit);

  res.json({
    success: true,
    message: "Productos obtenidos correctamente",
    data: products,
    meta: {
      totalItems,
      itemCount: products.length,
      page: currentPage,
      limit,
      totalPages,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      search,
      categoria
    }
  });
}

export async function getProductById(req, res) {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError(404, "Producto no encontrado");
  }

  res.json({
    success: true,
    message: "Producto obtenido correctamente",
    data: product
  });
}

export async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError(404, "Producto no encontrado");
  }

  product.set(req.body);
  await product.save();

  res.json({
    success: true,
    message: "Producto actualizado correctamente",
    data: product
  });
}

export async function deleteProduct(req, res) {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError(404, "Producto no encontrado");
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: "Producto eliminado correctamente"
  });
}
