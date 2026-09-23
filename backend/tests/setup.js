// Se carga con `node --import ./tests/setup.js` antes de las pruebas.
import { register } from "node:module";

register("./helpers/loader.js", import.meta.url);

// Variables de entorno de prueba: base de datos local y secretos falsos.
// NUNCA se usa la base de datos real (.env) durante las pruebas.
process.env.DB_URI = process.env.TEST_DB_URI || "mongodb://127.0.0.1:27017/maquilishuat_test";
process.env.JWT_SECRET_KEY = "test-secret";
process.env.USER_EMAIL = "test@maquilishuat.test";
process.env.USER_PASSWORD = "test";
process.env.CLOUDINARY_CLOUD_NAME = "test";
process.env.CLOUDINARY_API_KEY = "test";
process.env.CLOUDINARY_API_SECRET = "test";
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || "100000";
