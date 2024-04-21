export interface HosQueue {
  hn?:             string;
  vn?:             string;
  display_text?:   string
  oqueue?:         number;
  main_dep_queue?: number;
  cur_dep?:        string;
  main_dep?:       string;
  department?:     null | string;
  vstdate?:        Date;
  confirm_all?:    string
  lab_count?:      number | null;
  report_count?:   number | null;
  read_status?:    null;
  pname?:          string;
  fname?:          string;
  lname?:          string;
  pttype_check?:   string;
}