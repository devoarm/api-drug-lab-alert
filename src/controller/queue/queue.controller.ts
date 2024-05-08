import express, { Request, Response } from "express";
import moment from "moment";
import { prisma } from "../..";
import { queue_service } from "@prisma/client";

export const NextQueue = async (req: Request, res: Response) => {
  let { cur_dep } = req.query;
  try {
    const query = await prisma.queue_service.findMany({
      where: {
        cur_dep: `${cur_dep}`,
        status_call: { in: ["calling", "wait"] },
        vstdate: moment().format("YYYY-MM-DD"),
        stay: false,
      },
      orderBy: { oqueue: "asc" },
    });
    return res.json({ status: 200, results: query });
  } catch (error: any) {
    return res.json({ status: 500, err: error.message });
  }
};
export const CallQueue = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const updateCalled = await prisma.queue_service.updateMany({
      where: { cur_users_id: body.cur_users_id, status_call: "calling" },
      data: { status_call: "success", cur_users_id: null },
    });
    const query = await prisma.queue_service.updateMany({
      where: { cur_dep: body.cur_dep, vn: body.vn },
      data: {
        status_call: "calling",
        cur_users_id: body.cur_users_id,
        stay: false,
      },
    });
    return res.json({ status: 200, results: query });
  } catch (error: any) {
    return res.json({ status: 500, results: error.message });
  }
};
export const SearchQueue = async (req: Request, res: Response) => {
  let slug = `%${req.query.slug}%`;

  try {
    const query: [] = await prisma.$queryRaw`SELECT * FROM queue_service qs
    WHERE 
      (qs.hn LIKE ${slug} OR CONCAT(qs.display_text,' ',qs.oqueue) LIKE ${slug} OR CONCAT(qs.pname,qs.fname,' ',qs.lname) LIKE ${slug})
      AND qs.vstdate = ${moment().format("YYYY-MM-DD")}`;
    const uniqueValues = new Set();
    const lastCurDep = query
      .map((value: any) => {
        if (!uniqueValues.has(value.vn)) {
          uniqueValues.add(value.vn);
          return value; // Return the value if it's not a duplicate
        }
        return null; // Return null for duplicates
      })
      .filter((value: any) => value !== null);
    return res.json({ status: 200, results: lastCurDep });
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
        status_call: { in: ["stay", "calling"] },
        stay: true,
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
        status_call: { in: ["success", "calling", "stay"] },
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
    const update = await prisma.queue_service.updateMany({
      where: {
        vn: body.vn,
        cur_dep: body.cur_dep,
        vstdate: moment(body.vstdate).format("YYYY-MM-DD"),
      },
      data: { status_call: "stay", stay: true },
    });
    return res.json({ status: 200, results: update });
  } catch (error: any) {
    return res.json({ status: 500, err: error.message });
  }
};
export const SetPassQueue = async (req: Request, res: Response) => {
  let body: queue_service = req.body;
  try {
    const update = await prisma.queue_service.update({
      where: { id: body.id },
      data: { status_call: "success", stay: false },
    });
    return res.json({ status: 200, results: update });
  } catch (error: any) {
    return res.json({ status: 500, err: error.message });
  }
};
export const CreateCallName = async (req: Request, res: Response) => {
  try {
    const findOld = await prisma.list_callname_department.findFirst({
      where: { name: req.body.name, depcode: req.body.depcode },
    });
    if (findOld) {
      return res.json({ status: "301", results: "Already have it" });
    }
    const query = await prisma.list_callname_department.create({
      data: {
        name: req.body.name,
        depcode: req.body.depcode,
      },
    });
    return res.json({ status: 200, results: query });
  } catch (error: any) {
    return res.json({ status: 500, results: error.message });
  }
};
export const GetCallName = async (req: Request, res: Response) => {
  const { depcode } = req.query;
  try {
    const query = await prisma.list_callname_department.findMany({
      where: { depcode: `${depcode}`, isActive: true },
    });
    return res.json({ status: 200, results: query });
  } catch (error: any) {
    return res.json({ status: 500, results: error.message });
  }
};
