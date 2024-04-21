import moment from "moment";
import { HosQueue } from "../../types/queue/index.type";
import dbHos from "../../config/dbHos";
import { prisma } from "../..";
type TypeInsertNewVn = () => Promise<{
  status: number;
  results: any;
  service_name: string;
}>;

export const InsertNewVn: TypeInsertNewVn = async () => {
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
    const findService = await prisma.queue_service.findMany({
      where: { vstdate: moment().format("YYYY-MM-DD") },
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
        return {
          status: 200,
          results: createQueue,
          service_name: "insert new vn",
        };
      }
      return {
        status: 301,
        results: "not new vn",
        service_name: "insert new vn",
      };
    } else {
      return {
        status: 301,
        results: dataHos,
        service_name: "insert new vn",
      };
    }
  } catch (error: any) {
    return {
      status: 500,
      results: error.message,
      service_name:'insert new vn'
    };
  }
};
