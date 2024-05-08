import moment from "moment";
import { HosQueue } from "../../types/queue/index.type";
import dbHos from "../../config/dbHos";
import { prisma } from "../..";
import { io } from "socket.io-client";
type TypeInsertNewVn = () => Promise<{
  status: number;
  results: any;
  service_name: string;
}>;

export const InsertNewVnAndUpdateDep = async () => {
  try {
    const visit = await dbHos.raw(`SELECT
        p.hn,
        v.vn,
        k.display_text,
        v.oqueue,
        v.main_dep_queue,
        v.cur_dep,
        v.main_dep,
        k.department,
        v.vstdate,
        xh.confirm_all,
        l.lab_count,
        l.report_count,
        l.read_status,
        p.pname,
        p.fname,
        p.lname,
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
        AND v.hn NOT IN ( '' )
      ORDER BY
        v.oqueue`);
    const dataHos: HosQueue[] = visit[0];
    const insert = await InsertNewVn(dataHos);
    const update_dep = await UpdateDep(dataHos);
    if (insert.results > 0 || update_dep.results > 0) {
      const socket = io(process.env.socketUrl!);
      socket.emit(`update list call`, {});
      console.log({
        status: 200,
        insert: insert,
        update_dep: update_dep,
      });
    }
    return {
      status: 200,
      insert: insert,
      update_dep: update_dep,
    };
  } catch (error: any) {
    return {
      status: 500,
      results: error.message,
    };
  }
};
export const InsertNewVn = async (dataHos: HosQueue[]) => {
  try {
    const findService = await prisma.queue_service.findMany({
      where: { vstdate: moment().format("YYYY-MM-DD") },
      orderBy: { createdAt: "desc" },
    });
    if (dataHos.length > 0) {
      const findNotInService: any = dataHos
        .map((hos) => {
          const findHos = findService.filter((qs) => hos.vn == qs.vn);
          if (findHos.length > 0) {
            return null;
          }
          return { ...hos, vstdate: moment(hos.vstdate).format("YYYY-MM-DD") };
        })
        .filter((item) => item != null);
      if (findNotInService.length > 0) {
        const createQueue = await prisma.queue_service.createMany({
          data: [...findNotInService],
        });
        console.log("create new vn");
      }

      return {
        status: 200,
        results: findNotInService.length,
        service_name: "insert new vn",
      };
    } else {
      return {
        status: 301,
        results: 0,
        service_name: "insert new vn",
      };
    }
  } catch (error: any) {
    return {
      status: 500,
      results: 0,
      service_name: `insert new vn ${error.message}`,
    };
  }
};
export const UpdateDep = async (dataHos: HosQueue[]) => {
  try {
    const findService = await prisma.queue_service.findMany({
      where: { vstdate: moment().format("YYYY-MM-DD") },
      orderBy: { createdAt: "desc" },
    });
    if (dataHos.length > 0) {
      const uniqueValues = new Set();
      const lastCurDep = findService
        .map((value) => {
          if (!uniqueValues.has(value.vn)) {
            uniqueValues.add(value.vn);
            return value; // Return the value if it's not a duplicate
          }
          return null; // Return null for duplicates
        })
        .filter((value) => value !== null);
      const findNewDep: any = dataHos
        .map((hos) => {
          const findCurUpdate = lastCurDep.filter(
            (find: any) => hos.vn == find.vn && hos.cur_dep == find.cur_dep
          );
          if (findCurUpdate.length) {
            return null;
          }
          return { ...hos, vstdate: moment(hos.vstdate).format("YYYY-MM-DD") };
        })
        .filter((item) => item != null);
      if (findNewDep.length > 0) {
        const createQueue = await prisma.queue_service.createMany({
          data: [...findNewDep],
        });
        console.log("update new dep");
      }

      return {
        status: 200,
        results: findNewDep.length,
        service_name: "update new dep",
      };
    } else {
      return {
        status: 301,
        results: 0,
        service_name: "insert new vn",
      };
    }
  } catch (error: any) {
    return {
      status: 500,
      results: 0,
      service_name: `insert new vn : ${error.message}`,
    };
  }
};
