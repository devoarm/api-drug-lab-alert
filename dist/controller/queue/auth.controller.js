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
exports.login = void 0;
const dbHos_1 = __importDefault(require("../../config/dbHos"));
const md5_1 = __importDefault(require("md5"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.SECRET_KEY;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let body = req.body;
    try {
        const password = (0, md5_1.default)(body.password);
        const query = yield dbHos_1.default.raw(`SELECT 
        ou.loginname as username,
        ou.name	
    FROM opduser ou
    WHERE 
        ou.loginname = "${body.username}"
        AND ou.passweb = "${password}" 
        AND (ou.account_disable IS NULL OR ou.account_disable = "N")`);
        if (query[0].length > 0) {
            var token = jsonwebtoken_1.default.sign(Object.assign({}, query[0][0]), secret, { expiresIn: "12h" });
            return res.json({ status: 200, results: query[0][0], token: token });
        }
        else {
            return res.json({ status: 301, results: "no user" });
        }
    }
    catch (error) {
        return res.json({ status: 500, err: error.message });
    }
});
exports.login = login;
