import mongoose from "mongoose";

import { AppError } from "../utils/app-error.js";

export function validateObjectId(req, _res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError(400, "El identificador del producto no es valido"));
  }

  next();
}
