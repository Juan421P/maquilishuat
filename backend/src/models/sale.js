import { model, Schema } from "mongoose";

const saleSchema = new Schema({
    shopping_cart_id: {type: Schema.Types.ObjectId, ref: "shopping_cart"},
    delivery_address: {type: String},
    payment_method: {type: String},
    payment_status: {type: String}
},{
    timestamps: true,
    strict: false
})

export default model("sales", saleSchema)
