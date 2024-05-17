import express from "express";

import {
  InsertNewVn,
  InsertNewVnAndUpdateDep,
  UpdateDep,
} from "../controller/node-cron/insert-new-queue-main.controller";
import drugRouter from "./drug/index.routes";

const v1Router = express.Router();

v1Router.get("/", (req, res) => {
  res.json({
    status: 200,
    results: "route",
  });
});
v1Router.use("/drug", drugRouter);



export default v1Router;
