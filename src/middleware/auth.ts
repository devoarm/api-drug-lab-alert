import express, { Application, Request, Response, NextFunction } from "express";
require("dotenv").config();
var jwt = require("jsonwebtoken");
const secret = process.env.SECRET_KEY;
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {    
    const token = req.headers.authorization!.split(" ")[1];
    console.log(token)
    var decoded = jwt.verify(token, secret);
    // res.json({ status: "ok", decoded });
  } catch (error) {
    return res.json({ status: "401", msg: "NoToken", error });
  }
  return next();
};

export default verifyToken;
