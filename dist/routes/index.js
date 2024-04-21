"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const item_routes_1 = __importDefault(require("./item.routes"));
const index_routes_1 = __importDefault(require("./queue/index.routes"));
const v3Router = express_1.default.Router();
v3Router.get("/", (req, res) => {
    res.json({
        status: 200,
        results: "Api V3",
    });
});
v3Router.use("/item", item_routes_1.default);
v3Router.use("/queue", index_routes_1.default);
exports.default = v3Router;
