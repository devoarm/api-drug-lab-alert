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
exports.HosDoctor = exports.HosSpclty = exports.HosWard = exports.getLeader = void 0;
const dbHos_1 = __importDefault(require("../config/dbHos"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getLeader = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaderId = process.env.LEADER_ID;
        const leaderName = process.env.LEADER_NAME;
        return res.json({
            status: 200,
            results: { id: leaderId, name: leaderName },
        });
    }
    catch (error) {
        return res.json({ status: 500, results: error.message });
    }
});
exports.getLeader = getLeader;
const HosWard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = yield dbHos_1.default.raw(`SELECT k.depcode,k.department FROM kskdepartment k 
      WHERE 
        (k.depcode_active IS NULL OR k.depcode_active = "Y" )`);
        return res.json({ status: 200, results: query[0] });
    }
    catch (error) {
        return res.json({ status: 500, results: error.message });
    }
});
exports.HosWard = HosWard;
const HosSpclty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = yield dbHos_1.default.raw(`SELECT s.spclty,s.name as spclty_name FROM spclty s ORDER BY s.spclty`);
        return res.json({ status: 200, results: query[0] });
    }
    catch (error) {
        return res.json({ status: 500, results: error.message });
    }
});
exports.HosSpclty = HosSpclty;
const HosDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = yield dbHos_1.default.raw(`SELECT 
    d.code,
    d.name 
  FROM doctor d 
  WHERE
    d.active = 'Y'
    AND d.position_id = '1'`);
        return res.json({ status: 200, results: query[0] });
    }
    catch (error) {
        return res.json({ status: 500, results: error.message });
    }
});
exports.HosDoctor = HosDoctor;
