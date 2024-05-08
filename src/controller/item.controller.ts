import express, { Request, Response } from "express";
import moment from "moment";

import fs from "fs";

import dbHos from "../config/dbHos";
import dotenv from "dotenv";
import { prisma } from "..";
dotenv.config();

export const getLeader = async (req: Request, res: Response) => {
  try {
    const leaderId = process.env.LEADER_ID;
    const leaderName = process.env.LEADER_NAME;
    return res.json({
      status: 200,
      results: { id: leaderId, name: leaderName },
    });
  } catch (error: any) {
    return res.json({ status: 500, results: error.message });
  }
};
export const HosWard = async (req: Request, res: Response) => {
  try {
    const query = await dbHos.raw(
      `SELECT k.depcode,k.department FROM kskdepartment k 
      WHERE 
        (k.depcode_active IS NULL OR k.depcode_active = "Y" )`
    );
    return res.json({ status: 200, results: query[0] });
  } catch (error: any) {
    return res.json({ status: 500, results: error.message });
  }
};
export const HosSpclty = async (req: Request, res: Response) => {
  try {
    const query = await dbHos.raw(
      `SELECT s.spclty,s.name as spclty_name FROM spclty s ORDER BY s.spclty`
    );
    return res.json({ status: 200, results: query[0] });
  } catch (error: any) {
    return res.json({ status: 500, results: error.message });
  }
};
export const HosDoctor = async (req: Request, res: Response) => {
  try {
    const query = await dbHos.raw(`SELECT 
    d.code,
    d.name 
  FROM doctor d 
  WHERE
    d.active = 'Y'
    AND d.position_id = '1'`);
    return res.json({ status: 200, results: query[0] });
  } catch (error: any) {
    return res.json({ status: 500, results: error.message });
  }
};

