import productModel from "../models/product.js";

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
        const { name, images, product_type, flavor, size, price, stock, description } = req.body;

        if (!name || !product_type || price == null || stock == null) {
            return res.status(400).json({ message: "Fields required" });
        }

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
        const { name, images, product_type, flavor, size, price, stock, description } = req.body;

        const productUpdated = await productModel.findByIdAndUpdate(
            req.params.id,
            { name, images, product_type, flavor, size, price, stock, description },
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

        return res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default productController;
