import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
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
    birthdate: {
        type: Date,
        required: [true, 'date of birth is required'],
        validate: {
            validator: (value) => {
                if (!value || isNaN(value.getTime())) return false;
                const today = new Date();
                const birthdate = new Date(value);
                let age = today.getFullYear() - birthdate.getFullYear();
                const monthDiff = today.getMonth() - birthdate.getMonth();
                if(monthDiff < 0 || monthDiff === 0 && today.getDate() < birthdate.getDate()) age--;
                return (age >= 18);
            }, message: 'Debes ser mayor de 18 años'
        }
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
    },
    loginAttemps: {
        type: Number
    },
    timeOut: {
        type: Date
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
export default model('client', schema);