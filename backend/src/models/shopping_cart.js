import { Schema, model } from 'mongoose';
const schema = new Schema({
    products: [
        {
            product_id: {
                type: Schema.Types.ObjectId,
                ref: 'products'
            },
            amount: {
                type: Number
            },
            subtotal: {
                type: Number
            }
        }
    ],
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'client'
    },
    total: {
        type: Number
    },
    discount: {
        type: Number,
        default: 0
    },
    total_with_discount: {
        type: Number
    }
}, {
    timestamps: true
});
export default model('shopping_cart', schema);
