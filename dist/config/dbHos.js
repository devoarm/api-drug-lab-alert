"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbHos = (0, knex_1.default)({
    client: "mysql",
    connection: {
        host: process.env.hostHosXp,
        port: 3306,
        user: process.env.userHosXp,
        password: process.env.passwordHosXp,
        database: process.env.databaseHosXp,
    },
    pool: {
        min: 0,
        max: 30,
        afterCreate: (conn, done) => {
            conn.query("SET NAMES utf8", (err) => {
                done(err, conn);
            });
        },
    },
    debug: false,
});
exports.default = dbHos;
