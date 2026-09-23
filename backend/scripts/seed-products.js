// Script para sembrar productos de ejemplo con imágenes, así podés ver el
// catálogo funcionando sin tener que subir fotos reales a mano desde el
// panel de admin.
//
// Uso:
//   npm run seed
//
// Las imágenes son placeholders generados por placehold.co (no requieren
// API key ni login) con el nombre del producto y colores de la marca, para
// no usar fotos con derechos de autor. Cuando tengas fotos reales, subilas
// vía POST /api/products (multipart, campo "images") y listo, se guardan en
// Cloudinary igual que cualquier producto normal.
import "../database.js";
import mongoose from "mongoose";
import productModel from "../src/models/product.js";

const placeholder = (label, bg, fg = "ffffff") =>
    `https://placehold.co/600x600/${bg}/${fg}/png?text=${encodeURIComponent(label)}&font=roboto`;

const products = [
    {
        name: "Garrafón 20L",
        product_type: "Garrafones",
        flavor: "Natural",
        size: "20L",
        price: 3.5,
        stock: 40,
        description: "Garrafón retornable de 20 litros de agua purificada, ideal para dispensadores.",
        images: [{ image: placeholder("Garrafon 20L", "a855f7"), public_id: "seed-garrafon-20l" }],
    },
    {
        name: "Garrafón 10L",
        product_type: "Garrafones",
        flavor: "Natural",
        size: "10L",
        price: 2.25,
        stock: 55,
        description: "Presentación de 10 litros, fácil de manipular, perfecta para hogares pequeños.",
        images: [{ image: placeholder("Garrafon 10L", "9333ea"), public_id: "seed-garrafon-10l" }],
    },
    {
        name: "Botellón 5L",
        product_type: "Botellones",
        flavor: "Natural",
        size: "5L",
        price: 1.5,
        stock: 70,
        description: "Botellón de 5 litros con asa, práctico para llevar a la oficina o de viaje.",
        images: [{ image: placeholder("Botellon 5L", "ec4899"), public_id: "seed-botellon-5l" }],
    },
    {
        name: "Pack Botellas 600ml (x24)",
        product_type: "Paquetes",
        flavor: "Natural",
        size: "600ml x24",
        price: 6.0,
        stock: 30,
        description: "Paquete de 24 botellas individuales de 600ml, ideal para eventos.",
        images: [{ image: placeholder("Pack 600ml x24", "06b6d4"), public_id: "seed-pack-600ml" }],
    },
    {
        name: "Agua Saborizada Limón",
        product_type: "Saborizadas",
        flavor: "Limón",
        size: "1L",
        price: 1.75,
        stock: 25,
        description: "Agua purificada con un toque natural de limón, sin azúcar añadida.",
        images: [{ image: placeholder("Sabor Limon", "22d3ee", "111827"), public_id: "seed-sabor-limon" }],
    },
    {
        name: "Agua Saborizada Fresa",
        product_type: "Saborizadas",
        flavor: "Fresa",
        size: "1L",
        price: 1.75,
        stock: 22,
        description: "Agua purificada con esencia natural de fresa, refrescante y ligera.",
        images: [{ image: placeholder("Sabor Fresa", "f472b6", "111827"), public_id: "seed-sabor-fresa" }],
    },
    {
        name: "Dispensador para Garrafón",
        product_type: "Accesorios",
        flavor: "N/A",
        size: "Único",
        price: 18.99,
        stock: 12,
        description: "Dispensador manual de agua fría/caliente, compatible con garrafones de 10L y 20L.",
        images: [{ image: placeholder("Dispensador", "7e22ce"), public_id: "seed-dispensador" }],
    },
    {
        name: "Bidón Retornable 20L (vacío)",
        product_type: "Accesorios",
        flavor: "N/A",
        size: "20L",
        price: 8.0,
        stock: 18,
        description: "Bidón vacío retornable de 20L para iniciar tu ciclo de recarga con nosotros.",
        images: [{ image: placeholder("Bidon Vacio", "4a0d5c"), public_id: "seed-bidon-vacio" }],
    },
];

async function seed() {
    // esperamos a que database.js abra la conexión
    await new Promise((resolve) => mongoose.connection.once("open", resolve));

    let created = 0;
    for (const p of products) {
        const exists = await productModel.findOne({ name: p.name });
        if (exists) continue;
        await new productModel(p).save();
        created++;
    }

    console.log(`Listo: ${created} producto(s) nuevo(s) insertado(s), ${products.length - created} ya existían.`);
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("Error sembrando productos:", err);
    process.exit(1);
});
