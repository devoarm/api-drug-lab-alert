import express, { ErrorRequestHandler, Request, Response } from "express";


import verifyToken from "../middleware/auth";
import { HosSpclty, HosWard } from "../controller/item.controller";

const itemRoutes = express.Router();

itemRoutes.get("/ward", HosWard);
itemRoutes.get("/spclty", verifyToken, HosSpclty);


export default itemRoutes;
