import {
  CallQueue,
  HistoryQueue,
  NextQueue,
  SearchQueue,
  SetStayQueue,
  StayQueue,
} from "../../controller/queue/queue.controller";
import authRouter from "./auth/auth.routes";

var express = require("express");

var queueRouter = express.Router();
queueRouter.use("/auth", authRouter);
queueRouter.get("/next-queue", NextQueue);
queueRouter.post("/call-queue", CallQueue);
queueRouter.get("/search-queue", SearchQueue);
queueRouter.get("/stay-queue", StayQueue);
queueRouter.get("/history-queue", HistoryQueue);
queueRouter.put("/stay-queue", SetStayQueue);
export default queueRouter;
