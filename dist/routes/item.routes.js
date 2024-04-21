"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const item_controller_1 = require("../controller/item.controller");
const itemRoutes = express_1.default.Router();
itemRoutes.get("/ward", item_controller_1.HosWard);
itemRoutes.get("/spclty", auth_1.default, item_controller_1.HosSpclty);
exports.default = itemRoutes;
