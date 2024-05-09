import express, { ErrorRequestHandler, Request, Response } from "express";
import nodemailer from "nodemailer";

import verifyToken from "../middleware/auth";
import { HosSpclty, HosWard } from "../controller/item.controller";

const itemRoutes = express.Router();

itemRoutes.get("/ward", HosWard);
itemRoutes.get("/spclty", verifyToken, HosSpclty);
itemRoutes.get("/mail", (req: Request, res: Response) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dr.developer.dr@gmail.com",
      pass: "yrpnfdrhixxbbknl",
    },
  });

  var mailOptions = {
    from: "dr.developer.dr@gmail.com",
    to: "pnpnd2107@gmail.com",
    subject: "เล่นเกมบ่",
    text: "อยากเจอทีมโหด",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.json({ status: 500, results: error.message});
    } else {
      res.json({ status: 200, results: "ok" });
    }
  });
});

export default itemRoutes;
