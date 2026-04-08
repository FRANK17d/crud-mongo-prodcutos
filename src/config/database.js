import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Falta configurar MONGODB_URI para MongoDB Atlas");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });

  console.log("MongoDB Atlas conectado exitosamente");
}
