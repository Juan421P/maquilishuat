import { model, Schema } from "mongoose";

const productSchema = new Schema({
    name: {type: String},
    images: [{
        image: {type: String},
        public_id: {type: String}
    }],
    product_type: {type: String},
    flavor: {type: String},
    size: {type: String},
    price: {type: Number},
    stock: {type: Number},
    description: {type: String}
},{
    timestamps: true
})

export default model("products", productSchema)
