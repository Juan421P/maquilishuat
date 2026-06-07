import clientModel from "../models/client.js";

const clientController = {};

clientController.getClient = async (req, res) => {
    try {
        const clients = await clientModel.find();
        return res.status(200).json(clients);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

clientController.updateClient = async (req, res) => {
    try {
        let { name, lastname, birthdate, email, password, verified_email, loginAttemps, timeOut } = req.body;

        name = name?.trim();
        email = email?.trim();

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Fields required" });
        }

        if (birthdate > new Date() || birthdate < new Date("1901-01-01")) {
            return res.status(400).json({ message: "Invalid date" });
        }

        const clientUpdated = await clientModel.findByIdAndUpdate(
            req.params.id,
            { name, lastname, birthdate, email, password, verified_email, loginAttemps, timeOut },
            { new: true }
        );

        if (!clientUpdated) {
            return res.status(404).json({ message: "Client not found" });
        }

        return res.status(200).json({ message: "Client updated" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

clientController.deleteClient = async (req, res) => {
    try {
        const deletedClient = await clientModel.findByIdAndDelete(req.params.id);

        if (!deletedClient) {
            return res.status(404).json({ message: "Client not found" });
        }

        return res.status(200).json({ message: "Client deleted" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default clientController;
