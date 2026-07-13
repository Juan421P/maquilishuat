const meController = {};

meController.me = (req, res) => {
    return res.status(200).json({ id: req.user.id, userType: req.user.userType });
};

export default meController;
