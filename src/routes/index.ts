import express from "express";
import itemRoutes from "./item.routes";
import queueRouter from "./queue/index.routes";

const v3Router = express.Router();

v3Router.get("/", (req, res) => {
  res.json({
    status: 200,
    results: "Api V3",
  });
});
v3Router.use("/item", itemRoutes);
v3Router.use("/queue", queueRouter);

export default v3Router;
