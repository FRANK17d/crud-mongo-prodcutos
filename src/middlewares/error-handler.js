import { AppError } from "../utils/app-error.js";

function normalizeError(error) {
  if (error instanceof AppError) {
    return {
      status: error.status,
      message: error.message,
      errors: error.details
    };
  }

  if (error?.name === "ValidationError") {
    return {
      status: 400,
      message: "Los datos enviados no son validos",
      errors: Object.values(error.errors).map((fieldError) => ({
        field: fieldError.path,
        message: fieldError.message
      }))
    };
  }

  if (error?.name === "CastError") {
    return {
      status: 400,
      message: "El identificador enviado no es valido"
    };
  }

  return {
    status: error.status || 500,
    message: error.message || "Ha ocurrido un error interno"
  };
}

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, `Ruta no encontrada: ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  const { status, message, errors } = normalizeError(error);
  const response = {
    success: false,
    message:
      status === 500 && process.env.NODE_ENV === "production"
        ? "Ha ocurrido un error interno"
        : message
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(status).json(response);
}
