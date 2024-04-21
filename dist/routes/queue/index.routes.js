"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_controller_1 = require("../../controller/queue/queue.controller");
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
var express = require("express");
var queueRouter = express.Router();
queueRouter.use("/auth", auth_routes_1.default);
queueRouter.get("/next-queue", queue_controller_1.NextQueue);
queueRouter.post("/call-queue", queue_controller_1.CallQueue);
queueRouter.get("/search-queue", queue_controller_1.SearchQueue);
queueRouter.get("/stay-queue", queue_controller_1.StayQueue);
queueRouter.get("/history-queue", queue_controller_1.HistoryQueue);
queueRouter.put("/stay-queue", queue_controller_1.SetStayQueue);
exports.default = queueRouter;
