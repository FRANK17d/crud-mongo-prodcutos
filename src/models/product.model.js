import mongoose from "mongoose";

import { PRODUCT_CATEGORIES } from "../constants/product.constants.js";

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [120, "El nombre no puede superar 120 caracteres"]
    },
    descripcion: {
      type: String,
      required: [true, "La descripcion es obligatoria"],
      trim: true,
      minlength: [10, "La descripcion debe tener al menos 10 caracteres"],
      maxlength: [500, "La descripcion no puede superar 500 caracteres"]
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"]
    },
    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      min: [0, "El stock no puede ser negativo"],
      validate: {
        validator: Number.isInteger,
        message: "El stock debe ser un numero entero"
      }
    },
    categoria: {
      type: String,
      required: [true, "La categoria es obligatoria"],
      enum: {
        values: PRODUCT_CATEGORIES,
        message: "La categoria seleccionada no es valida"
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

productSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    return returnedObject;
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
