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
exports.SetStayQueue = exports.HistoryQueue = exports.StayQueue = exports.SearchQueue = exports.CallQueue = exports.NextQueue = void 0;
const dbHos_1 = __importDefault(require("../../config/dbHos"));
const moment_1 = __importDefault(require("moment"));
const __1 = require("../..");
const NextQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { cur_dep } = req.query;
    try {
        const queue = yield dbHos_1.default.raw(`SELECT
    p.hn,
    v.vn,
    k.display_text,
    v.oqueue,
    v.main_dep_queue,
    LPAD(v.oqueue, 4, '0') AS oqueue_text,	
    LPAD(v.main_dep_queue, 3, '0') AS main_dep_queue_text,	
    v.cur_dep,
    v.main_dep,    
    k.department,
    v.vstdate,
    xh.confirm_all,
    l.lab_count,
    l.report_count,
    l.read_status,
    concat(p.pname, p.fname, ' ', p.lname) AS ptname,
    ovq.pttype_check 
  FROM
    ovst v
    LEFT OUTER JOIN patient p ON p.hn = v.hn
    LEFT OUTER JOIN lab_status l ON l.vn = v.vn
    LEFT OUTER JOIN xray_head xh ON xh.vn = v.vn
    LEFT OUTER JOIN ovst_seq ovq ON ovq.vn = v.vn
    LEFT OUTER JOIN kskdepartment k ON k.depcode = v.cur_dep 
  WHERE
    v.vstdate = '${(0, moment_1.default)().format("YYYY-MM-DD")}'
    AND v.cur_dep = '${cur_dep}' 
    AND v.cur_dep_busy = 'N' 
    AND v.hn NOT IN ( '' ) 
  ORDER BY
    v.oqueue`);
        const queueApp = yield __1.prisma.queue_service.findMany({
            where: {
                vstdate: (0, moment_1.default)().format("YYYY-MM-DD"),
                cur_dep: cur_dep === null || cur_dep === void 0 ? void 0 : cur_dep.toString(),
            },
        });
        const hosQueue = queue[0];
        if (hosQueue.length > 0) {
            const mapQueue = hosQueue.map((itemHos) => {
                const findStatus = queueApp.filter((itemApp) => itemApp.vn == itemHos.vn && itemApp.cur_dep == itemHos.cur_dep);
                return Object.assign(Object.assign({}, itemHos), { status_call: findStatus.length > 0 ? findStatus[0].status_call : "wait", cur_staff: findStatus.length > 0 ? findStatus[0].cur_staff : "" });
            });
            const filterQueue = mapQueue.filter((item) => item.status_call == "called" || item.status_call == "wait");
            return res.json({ status: 200, results: filterQueue });
        }
        return res.json({ status: 200, results: queue[0] });
    }
    catch (error) {
        return res.json({ status: 500, err: error.message });
    }
});
exports.NextQueue = NextQueue;
const CallQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const findVn = yield __1.prisma.queue_service.findFirst({
            where: { vn: body.vn, cur_dep: body.cur_dep, vstdate: body.vstdate },
        });
        if (!findVn) {
            const updateToSuccess = yield __1.prisma.queue_service.updateMany({
                where: {
                    status_call: "called",
                    cur_staff: body.cur_staff,
                },
                data: { status_call: "success" },
            });
            const service = yield __1.prisma.queue_service.create({
                data: Object.assign(Object.assign({}, body), { status_call: "called" }),
            });
            return { status: 200, service };
        }
        else {
            const updateToSuccess = yield __1.prisma.queue_service.updateMany({
                where: {
                    status_call: "called",
                    cur_staff: body.cur_staff,
                },
                data: { status_call: "success" },
            });
            const updateStatus = yield __1.prisma.queue_service.updateMany({
                where: {
                    vn: body.vn,
                    cur_dep: body.cur_dep,
                },
                data: { status_call: "called" },
            });
            return res.json({ status: 200, results: updateStatus });
        }
    }
    catch (error) {
        return res.json({ status: 500, results: error.message });
    }
});
exports.CallQueue = CallQueue;
const SearchQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { slug } = req.query;
    try {
        const sQueuery = `SELECT
    p.hn,
    v.vn,
    k.display_text,
    v.oqueue,
    v.main_dep_queue,
    LPAD( v.oqueue, 4, '0' ) AS oqueue_text,
    LPAD( v.main_dep_queue, 3, '0' ) AS main_dep_queue_text,
    v.cur_dep,
    v.main_dep,
    k.department,
    v.vstdate,
    xh.confirm_all,
    l.lab_count,
    l.report_count,
    l.read_status,
    concat( p.pname, p.fname, ' ', p.lname ) AS ptname,
    ovq.pttype_check 
  FROM
    ovst v
    LEFT OUTER JOIN patient p ON p.hn = v.hn
    LEFT OUTER JOIN lab_status l ON l.vn = v.vn
    LEFT OUTER JOIN xray_head xh ON xh.vn = v.vn
    LEFT OUTER JOIN ovst_seq ovq ON ovq.vn = v.vn
    LEFT OUTER JOIN kskdepartment k ON k.depcode = v.cur_dep 
  WHERE
    ( v.hn = "${slug}" OR p.cid = "${slug}" OR v.oqueue Like "%${slug}%" ) 
    AND v.vstdate = DATE(
    NOW())
  limit 10`;
        const query = yield dbHos_1.default.raw(sQueuery);
        return res.json({ status: 200, results: query[0] });
    }
    catch (error) {
        return res.json({ status: 500, err: error.message });
    }
});
exports.SearchQueue = SearchQueue;
const StayQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { cur_dep } = req.query;
    try {
        const query = yield __1.prisma.queue_service.findMany({
            where: {
                cur_dep: cur_dep === null || cur_dep === void 0 ? void 0 : cur_dep.toString(),
                vstdate: (0, moment_1.default)().format("YYYY-MM-DD"),
                status_call: { in: ["stay", "called"] },
            },
            orderBy: { oqueue: "asc" },
        });
        return res.json({ status: 200, results: query });
    }
    catch (error) {
        return res.json({ status: 500, err: error.message });
    }
});
exports.StayQueue = StayQueue;
const HistoryQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { cur_dep } = req.query;
    try {
        const query = yield __1.prisma.queue_service.findMany({
            where: {
                cur_dep: cur_dep === null || cur_dep === void 0 ? void 0 : cur_dep.toString(),
                vstdate: (0, moment_1.default)().format("YYYY-MM-DD"),
                status_call: { in: ["success", "failed", 'called'] },
            },
            orderBy: { updatedAt: "desc" },
        });
        return res.json({ status: 200, results: query });
    }
    catch (error) {
        return res.json({ status: 500, err: error.message });
    }
});
exports.HistoryQueue = HistoryQueue;
const SetStayQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let body = req.body;
    try {
        const query = yield __1.prisma.queue_service.findFirst({
            where: {
                vn: body.vn,
                cur_dep: body.cur_dep,
                vstdate: (0, moment_1.default)(body.vstdate).format("YYYY-MM-DD"),
            },
        });
        if (query) {
            const update = yield __1.prisma.queue_service.update({
                where: { id: query.id },
                data: { status_call: "stay" },
            });
            return res.json({ status: 200, results: update });
        }
        else {
            const creactQueue = yield __1.prisma.queue_service.create({
                data: Object.assign(Object.assign({}, body), { status_call: "stay" }),
            });
            return res.json({ status: 200, results: creactQueue });
        }
    }
    catch (error) {
        return res.json({ status: 500, err: error.message });
    }
});
exports.SetStayQueue = SetStayQueue;
