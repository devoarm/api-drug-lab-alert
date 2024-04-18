import express, { Request, Response } from "express";
import dbHos from "../../config/dbHos";
import moment from "moment";
import { prisma } from "../..";
import { queue_service } from "@prisma/client";

export const NextQueue = async (req: Request, res: Response) => {
  let { cur_dep } = req.query;
  try {
    const queue = await dbHos.raw(`SELECT
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
    v.vstdate = '${moment().format("YYYY-MM-DD")}'
    AND v.cur_dep = '${cur_dep}' 
    AND v.cur_dep_busy = 'N' 
    AND v.hn NOT IN ( '' ) 
  ORDER BY
    v.oqueue`);
    const queueApp = await prisma.queue_service.findMany({
      where: {
        vstdate: moment().format("YYYY-MM-DD"),
        cur_dep: cur_dep?.toString(),
      },
    });
    const hosQueue = queue[0];
    if (hosQueue.length > 0) {
      const mapQueue = hosQueue.map((itemHos: any) => {
        const findStatus = queueApp.filter(
          (itemApp) =>
            itemApp.vn == itemHos.vn && itemApp.cur_dep == itemHos.cur_dep
        );
        return {
          ...itemHos,
          status_call:
            findStatus.length > 0 ? findStatus[0].status_call : "wait",
          cur_staff: findStatus.length > 0 ? findStatus[0].cur_staff : "",
        };
      });
      const filterQueue = mapQueue.filter(
        (item: any) =>
          item.status_call == "called" || item.status_call == "wait"
      );
      return res.json({ status: 200, results: filterQueue });
    }
    return res.json({ status: 200, results: queue[0] });
  } catch (error: any) {
    return res.json({ status: 500, err: error.message });
  }
};
export const CallQueue = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const findVn = await prisma.queue_service.findFirst({
      where: { vn: body.vn, cur_dep: body.cur_dep, vstdate: body.vstdate },
    });
    if (!findVn) {
      const updateToSuccess = await prisma.queue_service.updateMany({
        where: {          
          status_call: "called",
          cur_staff: body.cur_staff,
        },
        data: { status_call: "success" },
      });

      const service = await prisma.queue_service.create({
        data: { ...body, status_call: "called" },
      });
      return { status: 200, service };
    } else {
      const updateToSuccess = await prisma.queue_service.updateMany({
        where: {
          status_call: "called",
          cur_staff: body.cur_staff,
        },
        data: { status_call: "success" },
      });
      const updateStatus = await prisma.queue_service.updateMany({
        where: {
          vn: body.vn,
          cur_dep: body.cur_dep,
        },
        data: { status_call: "called" },
      });
      return res.json({ status: 200, results: updateStatus });
    }
  } catch (error: any) {
    return res.json({ status: 500, results: error.message });
  }
};
export const SearchQueue = async (req: Request, res: Response) => {
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
    const query = await dbHos.raw(sQueuery);    
    return res.json({ status: 200, results: query[0] });
  } catch (error: any) {
    return res.json({ status: 500, err: error.message });
  }
};
export const StayQueue = async (req: Request, res: Response) => {
  let { cur_dep } = req.query;
  try {
    const query = await prisma.queue_service.findMany({
      where: {
        cur_dep: cur_dep?.toString(),
        vstdate: moment().format("YYYY-MM-DD"),
        status_call: { in: ["stay", "called"] },
      },
      orderBy: { oqueue: "asc" },
    });

    return res.json({ status: 200, results: query });
  } catch (error: any) {
    return res.json({ status: 500, err: error.message });
  }
};
export const HistoryQueue = async (req: Request, res: Response) => {
  let { cur_dep } = req.query;
  try {
    const query = await prisma.queue_service.findMany({
      where: {
        cur_dep: cur_dep?.toString(),
        vstdate: moment().format("YYYY-MM-DD"),
        status_call: { in: ["success", "failed",'called'] },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({ status: 200, results: query });
  } catch (error: any) {
    return res.json({ status: 500, err: error.message });
  }
};
export const SetStayQueue = async (req: Request, res: Response) => {
  let body: queue_service = req.body;
  try {
    const query = await prisma.queue_service.findFirst({
      where: {
        vn: body.vn,
        cur_dep: body.cur_dep,
        vstdate: moment(body.vstdate).format("YYYY-MM-DD"),
      },
    });

    if (query) {
      const update = await prisma.queue_service.update({
        where: { id: query.id },
        data: { status_call: "stay" },
      });
      return res.json({ status: 200, results: update });
    } else {
      const creactQueue = await prisma.queue_service.create({
        data: { ...body, status_call: "stay" },
      });
      return res.json({ status: 200, results: creactQueue });
    }
  } catch (error: any) {
    return res.json({ status: 500, err: error.message });
  }
};
