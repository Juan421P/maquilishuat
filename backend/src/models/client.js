import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { EMAIL_REGEX, ageInYears, MIN_AGE } from '../utils/validation.js';
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
        match: [EMAIL_REGEX, 'Ingresa un correo válido']
    },
    birthdate: {
        type: Date,
        required: [true, 'date of birth is required'],
        validate: {
            validator: (value) => {
                if (!value || isNaN(value.getTime())) return false;
                // Componentes UTC: ver ageInYears() en utils/validation.js
                return ageInYears(value) >= MIN_AGE;
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