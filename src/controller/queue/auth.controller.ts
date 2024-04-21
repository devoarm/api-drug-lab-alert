import express, { Request, Response } from "express";
import dbHos from "../../config/dbHos";
import md5 from "md5";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../..";
const secret: any = process.env.SECRET_KEY;
const saltRounds = 10;
export const login = async (req: Request, res: Response) => {
  let body = req.body;
  try {
    const query = await prisma.users.findFirst({
      where: { username: body.username },
    });
    if (query) {
      bcrypt.compare(body.password, query.password, (err, result) => {
        if (err) {
          return res.json({
            status: 301,
            results: "error password",
          });
        } else {
          if (result) {
            var token = jwt.sign(
              {
                ...query,
              },
              secret,
              { expiresIn: "12h" }
            );
            return res.json({ status: 200, results: query, token: token });
          } else {
            return res.json({
              status: 301,
              results: "error password",
            });
          }
        }
      });
    } else {
      return res.json({
        status: 301,
        results: "error username",
      });
    }
  } catch (error: any) {
    return res.json({ status: 500, err: error.message });
  }
};
export const register = async (req: Request, res: Response) => {
  let body = req.body;
  try {
    bcrypt
      .hash(body.password, saltRounds)
      .then(async (hash: any) => {
        const query = await prisma.users.create({
          data: {
            username: body.username,
            password: hash,
            fullname: body.fullname,
          },
        });
        return res.json({ status: 200, results: query });
      })
      .catch((err: any) => {
        return res.json({ status: 500, results: err.message });
      });
  } catch (error: any) {
    return res.json({ status: 500, err: error.message })
  }
};
