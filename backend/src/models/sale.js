import { model, Schema } from "mongoose";

const saleSchema = new Schema({
    // unique: un carrito solo puede convertirse en UNA venta. Evita ventas
    // duplicadas (doble toque en "Confirmar", reintentos, etc.) incluso si
    // llegan dos requests al mismo tiempo.
    shopping_cart_id: {type: Schema.Types.ObjectId, ref: "shopping_cart", unique: true},
    delivery_address: {type: String},
    payment_method: {type: String},
    // El cliente NO decide este valor: al crear la venta el backend siempre
    // usa "pending"; solo el admin puede cambiarlo desde el panel.
    payment_status: {type: String, enum: ["pending", "paid", "partial"], default: "pending"},
    // Envío y total calculados por el backend al momento de la compra
    // (total = total del carrito con descuento + envío). Las ventas creadas
    // antes de este cambio no tienen estos campos.
    shipping_cost: {type: Number, default: 0},
    total: {type: Number}
},{
    timestamps: true
})

export default model("sales", saleSchema)
