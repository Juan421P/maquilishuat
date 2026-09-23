import productModel from "../models/product.js";
import { v2 as cloudinary } from "cloudinary";

const productController = {};

//SELECT
productController.getProducts = async (req, res) => {
    try {
        const products = await productModel.find();
        return res.status(200).json(products);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//SELECT por id
productController.getProductById = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//INSERT
productController.insertProduct = async (req, res) => {
    try {
        const { name, product_type, flavor, size, price, stock, description } = req.body;

        if (!name || !product_type || price == null || stock == null) {
            return res.status(400).json({ message: "Fields required" });
        }

        const images = (req.files || []).map((file) => ({
            image: file.path,
            public_id: file.filename
        }));

        const newProduct = new productModel({ name, images, product_type, flavor, size, price, stock, description });
        await newProduct.save();

        return res.status(201).json({ message: "Product saved" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//UPDATE
productController.updateProduct = async (req, res) => {
    try {
        const { name, product_type, flavor, size, price, stock, description } = req.body;

        const updateData = { name, product_type, flavor, size, price, stock, description };

        if (req.files && req.files.length > 0) {
            const productFound = await productModel.findById(req.params.id);

            if (!productFound) {
                return res.status(404).json({ message: "Product not found" });
            }

            for (const oldImage of productFound.images) {
                await cloudinary.uploader.destroy(oldImage.public_id);
            }

            updateData.images = req.files.map((file) => ({
                image: file.path,
                public_id: file.filename
            }));
        }

        const productUpdated = await productModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!productUpdated) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Product updated" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//DELETE
productController.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await productModel.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        for (const image of deletedProduct.images) {
            await cloudinary.uploader.destroy(image.public_id);
        }

        return res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default productController;
