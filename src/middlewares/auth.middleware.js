const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
};

const authUserMiddleware = (req, res, next) => {
    const token = req.cookies.token;    

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }   

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

       if (decoded.role !== "user") {
            return res.status(403).json({
                message: "No access"
            });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }   

}   

module.exports = {
    authMiddleware,
    authUserMiddleware
};

