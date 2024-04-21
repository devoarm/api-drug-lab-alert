"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
var jwt = require("jsonwebtoken");
const secret = process.env.SECRET_KEY;
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        var decoded = jwt.verify(token, secret);
        // res.json({ status: "ok", decoded });
    }
    catch (error) {
        return res.json({ status: "401", msg: "NoToken", error });
    }
    return next();
};
exports.default = verifyToken;
