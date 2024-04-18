import express, { Request, Response } from "express";
import dbHos from "../../config/dbHos";
import md5 from "md5";
import jwt from "jsonwebtoken";
const secret: any = process.env.SECRET_KEY;
export const login = async (req: Request, res: Response) => {
  let body = req.body;
  try {
    const password = md5(body.password);
    const query = await dbHos.raw(`SELECT 
        ou.loginname as username,
        ou.name	
    FROM opduser ou
    WHERE 
        ou.loginname = "${body.username}"
        AND ou.passweb = "${password}" 
        AND (ou.account_disable IS NULL OR ou.account_disable = "N")`);
    if (query[0].length > 0) {
      var token = jwt.sign(
        {
          ...query[0][0],
        },
        secret,
        { expiresIn: "12h" }
      );
      return res.json({ status: 200, results: query[0][0], token: token });
    } else {
      return res.json({ status: 301, results: "no user" });
    }
  } catch (error: any) {
    return res.json({ status: 500, err: error.message });
  }
};
