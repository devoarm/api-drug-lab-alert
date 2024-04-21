"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
const server = http_1.default.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        app.use((0, cors_1.default)());
        app.use(express_1.default.json());
        app.get("/", (req, res) => {
            res.json({
                status: 200,
                results: "AranHos API Build 2024-02-11 - 👋🌎🌍🌏",
            });
        });
        app.use("/api/queue-v3", routes_1.default);
        io.on("connection", (socket) => {
            console.log("socket connected");
            socket.on("disconnect", (msg) => {
                console.log("disconnect");
            });
            socket.on("call queue", (msg) => __awaiter(this, void 0, void 0, function* () {
                io.emit("call queue", msg);
            }));
            socket.on("stay queue", (msg) => __awaiter(this, void 0, void 0, function* () {
                io.emit("stay queue", msg);
            }));
        });
        server.listen(8778, () => console.log("server is running on port 8778"));
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.prisma.$connect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield exports.prisma.$disconnect();
    process.exit(1);
}));
