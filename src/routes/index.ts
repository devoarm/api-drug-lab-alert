import express from "express";
import itemRoutes from "./item.routes";
import queueRouter from "./queue/index.routes";

import {
  InsertNewVn,
  InsertNewVnAndUpdateDep,
  UpdateDep,
} from "../controller/node-cron/insert-new-queue-main.controller";

const v3Router = express.Router();

v3Router.get("/", (req, res) => {
  res.json({
    status: 200,
    results: "Api V3",
  });
});
v3Router.use("/item", itemRoutes);
v3Router.use("/queue", queueRouter);

v3Router.get("/service-update", async (req, res) => {
  try {
    const query:any = await InsertNewVnAndUpdateDep()
    return res.json({
      status: 200,
      results: query,      
    });
  } catch (error: any) {
    res.json({
      status: 500,
      results: error.message,
    });
  }
});

export default v3Router;
