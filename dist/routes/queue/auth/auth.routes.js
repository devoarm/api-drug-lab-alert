"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../../../controller/queue/auth.controller");
const authRouter = express_1.default.Router();
authRouter.post("/login", auth_controller_1.login);
exports.default = authRouter;
