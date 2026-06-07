import saleModel from "../models/sale.js";

const saleController = {};

//SELECT
saleController.getSales = async (req, res) => {
    try {
        const sales = await saleModel.find().populate("shopping_cart_id");
        return res.status(200).json(sales);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//SELECT por id
saleController.getSaleById = async (req, res) => {
    try {
        const sale = await saleModel.findById(req.params.id).populate("shopping_cart_id");

        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        return res.status(200).json(sale);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//INSERT
saleController.insertSale = async (req, res) => {
    try {
        const { shopping_cart_id, delivery_address, payment_method, payment_status } = req.body;

        if (!shopping_cart_id || !delivery_address || !payment_method) {
            return res.status(400).json({ message: "Fields required" });
        }

        const newSale = new saleModel({ shopping_cart_id, delivery_address, payment_method, payment_status });
        await newSale.save();

        return res.status(201).json({ message: "Sale saved" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//UPDATE
saleController.updateSale = async (req, res) => {
    try {
        const { shopping_cart_id, delivery_address, payment_method, payment_status } = req.body;

        const saleUpdated = await saleModel.findByIdAndUpdate(
            req.params.id,
            { shopping_cart_id, delivery_address, payment_method, payment_status },
            { new: true }
        );

        if (!saleUpdated) {
            return res.status(404).json({ message: "Sale not found" });
        }

        return res.status(200).json({ message: "Sale updated" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//DELETE
saleController.deleteSale = async (req, res) => {
    try {
        const deletedSale = await saleModel.findByIdAndDelete(req.params.id);

        if (!deletedSale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        return res.status(200).json({ message: "Sale deleted" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default saleController;
