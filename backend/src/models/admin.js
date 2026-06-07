import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'invalid email address']
    },
    verified_email: {
        type: Boolean,
        default: true
    },
    picture: {
        type: String,
        trim: true
    },
    picture_id: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
schema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});
schema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
export default model('admin', schema);