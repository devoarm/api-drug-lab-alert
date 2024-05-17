import express, { Express, Request, Response } from "express";
import http from "http";
import cron from "node-cron";


import cors from "cors";
import { PrismaClient, queue_service } from "@prisma/client";
import dbHos from "./config/dbHos";
import v1Router from "./routes";
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
      results: "Drug Lab Alert Build 2024-05-17 - version 1.1 👋🌎🌍🌏",
    });
  });
  app.use("/api/v1", v1Router);

  server.listen(process.env.PORT || 9889, () =>
    console.log(`server is running on port : ${process.env.PORT}`)
  );
}
main()

