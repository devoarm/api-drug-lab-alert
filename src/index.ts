import express, { Express, Request, Response } from "express";
import http from "http";
import cron from "node-cron";

import v3Router from "./routes";
import cors from "cors";
import { PrismaClient, queue_service } from "@prisma/client";
import dbHos from "./config/dbHos";
import { InsertNewVnAndUpdateDep } from "./controller/node-cron/insert-new-queue-main.controller";
require("dotenv").config();

const app = express();
export const prisma = new PrismaClient();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: `http://localhost:3000`,
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
    socket.on("update list call", () => {
      io.emit("update list call");
    });
    socket.on("call queue", async (msg: queue_service) => {
      console.log("call queue");
      io.emit("call queue", msg);
    });
    socket.on("stay queue", async (msg: queue_service) => {
      io.emit("stay queue", msg);
    });
  });

  server.listen(process.env.PORT || 9889, () =>
    console.log(`server is running on port : ${process.env.PORT}`)
  );
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
  try {
    const query: any = await InsertNewVnAndUpdateDep();
  } catch (error: any) {
    console.log({
      status: 500,
      results: error.message,
    });
  }
});
cron.schedule("0 0 1,5 * * *", async () => {
  try {
    const query: any = await dbHos.raw(`UPDATE hos.oapp o
    JOIN genius.clinic_map_depcode cmd ON cmd.clinic = o.clinic
    SET 
      o.depcode = cmd.depcode
    WHERE
      cmd.clinic IS NOT NULL AND
      o.nextdate = DATE(NOW())`);
    console.log("update depcode oapp");
  } catch (error: any) {
    console.log({
      status: 500,
      results: error.message,
    });
  }
});
