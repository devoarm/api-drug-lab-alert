export const PtSql = `SELECT UNIX_TIMESTAMP(concat(o.rxdate,' ',o.rxtime)) as unixrxdatetime, 
concat(o.rxdate,' ',o.rxtime) as rxdatetime, 
if(o.vn,o.vn,o.an) van,
IF(o.vn, "OPD", "IPD") as Typepatient,  o.hn, concat(pt.pname,pt.fname,' ',pt.lname) as ptname,
d.name as drugName
,IF(o.sp_use = "",concat(du.name1,' ',du.name2,' ',du.name3) ,concat(sp.name1,' ',sp.name2,' ',sp.name3)) as method
,dl.lab_items_name as lab_type
,lo.lab_order_result as lab_result
,concat(lh.report_date,' ',lh.report_time) as Labdatetime

FROM opitemrece o
LEFT JOIN drugitems d ON d.icode = o.icode
LEFT JOIN patient pt ON pt.hn = o.hn
LEFT JOIN drugusage du On du.drugusage = o.drugusage
LEFT JOIN sp_use sp ON o.sp_use = sp.sp_use
LEFT JOIN lab_head lh on lh.hn = o.hn
LEFT JOIN lab_order lo on lo.lab_order_number = lh.lab_order_number
LEFT JOIN drug_lab_alerted_pharma dl ON dl.generic_name = d.generic_name and dl.lab_items_code = lo.lab_items_code 

WHERE o.rxdate BETWEEN SUBDATE(CURDATE(), INTERVAL 6 DAY) AND CURDATE()
AND d.generic_name IN (SELECT generic_name FROM drug_lab_alerted_pharma)
AND pt.hn not in (select hn from vn_stat where hn = pt.hn and pdx = 'Z491' and vstdate BETWEEN (SUBDATE(o.vstdate, INTERVAL 1 YEAR)) AND (SUBDATE(o.vstdate, INTERVAL 1 DAY)) AND d.generic_name in ('naproxen'))
and o.qty > 0
and TIMESTAMPDIFF(YEAR,pt.birthday,CURDATE()) > 10

and lo.lab_items_code in (SELECT lab_items_code FROM drug_lab_alerted_pharma WHERE generic_name = d.generic_name)
and lo.lab_order_result BETWEEN dl.value_min  AND dl.value_max

and lh.lab_order_number = (
 select max(lh1.lab_order_number) 
 from lab_head lh1 
 LEFT JOIN lab_order lo1 on lo1.lab_order_number = lh1.lab_order_number 
 where lh1.hn = o.hn 
 and lh1.report_date BETWEEN SUBDATE(o.rxdate, INTERVAL 2 YEAR ) AND o.rxdate
 and concat(lh1.report_date,' ',lh1.report_time) < concat(o.rxdate,' ',o.rxtime)
 and lo1.lab_items_code in (SELECT lab_items_code FROM drug_lab_alerted_pharma ) 
 and lo1.lab_order_result > 0
)
   and lo.lab_order_result > 0

GROUP BY o.hn, o.icode
ORDER BY rxdatetime DESC`