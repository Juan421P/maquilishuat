import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';
import model from '../models/admin.js';
import { config } from '../../config.js';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: {
        user: config.email.user,
        pass: config.email.password
    }
});

const controller = {};

// CRUD
controller.get = async (req, res) => {
    try {
        const admins = await model.find();
        return res.status(200).json(admins);
    } catch (error) {
        return res.status(500).json({
            message: 'error retrieving admins',
            error: error.message
        });
    }
};

controller.delete = async (req, res) => {
    try {
        const admin = await model.findByIdAndDelete(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }
        return res.status(200).json({ message: 'admin deleted' });
    } catch (error) {
        return res.status(500).json({
            message: 'error deleting admin',
            error: error.message
        });
    }
};

controller.put = async (req, res) => {
    try {
        const { name, lastname, email, password } = req.body;
        const admin = await model.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }
        if (name) admin.name = name.trim();
        if (lastname) admin.lastname = lastname.trim();
        if (email) admin.email = email.trim();
        if (password) admin.password = password;
        if (req.file) {
            if (admin.picture_id) {
                await cloudinary.uploader.destroy(admin.picture_id);
            }
            admin.picture = req.file.path;
            admin.picture_id = req.file.filename;
        }
        // se usa save() (no findByIdAndUpdate) para que el hook pre('save') del modelo hashee la contraseña
        await admin.save();
        return res.status(200).json({ message: 'admin updated', admin });
    } catch (error) {
        return res.status(500).json({
            message: 'error updating admin',
            error: error.message
        });
    }
};

// Registro con verificación por código enviado al correo
controller.register = async (req, res) => {
    try {
        const { name, lastname, email, password } = req.body;
        const exists = await model.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'admin already exists' });
        }
        const code = crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign(
            { name, lastname, email, password, code },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        res.cookie('admin_register', token, { httpOnly: true, maxAge: 15 * 60 * 1000 });
        transporter.sendMail({
            from: config.email.user,
            to: email,
            subject: 'Verificación de cuenta',
            text: 'Para verificar tu cuenta, utiliza este código: ' + code + ' expira en 15min'
        }, (error) => {
            if (error) {
                return res.status(500).json({ message: 'error sending verification email' });
            }
            return res.status(200).json({ message: 'verification code sent' });
        });
    } catch (error) {
        return res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

controller.verify = async (req, res) => {
    try {
        const { code } = req.body;
        const token = req.cookies.admin_register;
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (code !== decoded.code) {
            return res.status(400).json({ message: 'invalid code' });
        }
        // se pasa la contraseña en texto plano: el hook pre('save') del modelo la hashea al crear
        const newAdmin = new model({
            name: decoded.name,
            lastname: decoded.lastname,
            email: decoded.email,
            password: decoded.password,
            verified_email: true
        });
        await newAdmin.save();
        res.clearCookie('admin_register');
        return res.status(200).json({ message: 'admin registered successfully' });
    } catch (error) {
        return res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

export default controller;
