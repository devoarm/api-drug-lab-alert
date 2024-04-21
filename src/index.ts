import express, { Express, Request, Response } from "express";
import http from "http";
import cron from "node-cron";

import v3Router from "./routes";
import cors from "cors";
import { PrismaClient, queue_service } from "@prisma/client";
import dbHos from "./config/dbHos";
import { InsertNewVn } from "./controller/node-cron/insert-new-vn.controller";

const app = express();
export const prisma = new PrismaClient();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
async function main() {
  app.use(cors());
  app.use(express.json());
  app.get("/", (req, res) => {
    res.json({
      status: 200,
      results: "AranHos API Build 2024-02-11 - 👋🌎🌍🌏",
    });
  });
  app.use("/api/queue-v3", v3Router);

  io.on("connection", (socket: any) => {
    console.log("socket connected");
    socket.on("disconnect", (msg: any) => {
      console.log("disconnect");
    });
    socket.on("call queue", async (msg: queue_service) => {
      io.emit("call queue", msg);
    });
    socket.on("stay queue", async (msg: queue_service) => {
      io.emit("stay queue", msg);
    });
  });

  server.listen(8778, () => console.log("server is running on port 8778"));
}
main()
  .then(async () => {
    await prisma.$connect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

cron.schedule("1,30 0-59 * * * *", async () => {
  const res = await InsertNewVn()
  console.log(res);
});
