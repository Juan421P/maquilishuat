import { Schema, model } from 'mongoose';

const schema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'products',
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'client',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

schema.index({ product_id: 1, user_id: 1 }, { unique: true });

export default model('review', schema);
