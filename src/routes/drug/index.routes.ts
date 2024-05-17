import express from "express";
import dbHos from "../../config/dbHos";
import { PtSql } from "../../../strQuery";
import verifyToken from "../../middleware/auth";

var drugRouter = express.Router();

drugRouter.get("/pt-lab", verifyToken, async (req: Request, res: any) => {
  try {
    const query = await dbHos.raw(PtSql);
    return res.json({ status: 200, results: query[0] });
  } catch (error: any) {
    return res.json({ status: 500, results: error.message });
  }
});

export default drugRouter;
