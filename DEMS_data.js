/* ================================================================
   data.js  –  All mock data for DEMS Dashboard
   C-DAC Cyber Security Group | Digital Evidence Management System
   ================================================================ */

// ── Stat Cards ────────────────────────────────────────────────────
const STAT_CARDS = [
    { icon:'📁', val:'247',   lbl:'Total Cases',          trend:'+12', dir:'up',   color:'blue'   },
    { icon:'🔴', val:'38',    lbl:'Open Cases',            trend:'+4',  dir:'up',   color:'red'    },
    { icon:'🔬', val:'64',    lbl:'Under Investigation',   trend:'+7',  dir:'up',   color:'orange' },
    { icon:'🗂️', val:'1,842', lbl:'Evidence Items',        trend:'+34', dir:'up',   color:'blue'   },
    { icon:'⏳', val:'12',    lbl:'SLA Breached',          trend:'+2',  dir:'up',   color:'red'    },
    { icon:'⚠️', val:'19',    lbl:'SLA Warning',           trend:'+3',  dir:'up',   color:'orange' },
    { icon:'✅', val:'145',   lbl:'Closed Cases',          trend:'+8',  dir:'up',   color:'green'  },
    { icon:'📋', val:'89',    lbl:'Analysis Reports',      trend:'+11', dir:'up',   color:'teal'   },
    { icon:'👥', val:'32',    lbl:'Active Users',          trend:'+2',  dir:'up',   color:'purple' },
    { icon:'💾', val:'2.4TB', lbl:'Storage Used',          trend:'+180GB',dir:'up', color:'orange' },
    { icon:'🔗', val:'3,210', lbl:'Custody Transfers',     trend:'+44', dir:'up',   color:'blue'   },
    { icon:'🔒', val:'99.8%', lbl:'Evidence Integrity',    trend:'0%',  dir:'up',   color:'green'  }
];

// ── Cases ─────────────────────────────────────────────────────────
const CASES_DATA = [
    { id:'CASE-2024-001', title:'Online Banking Fraud',          type:'Financial Fraud',  fir:'FIR/2024/001', inv:'Insp. Sharma',  court:'CBI Court Delhi',     priority:'critical', status:'under investigation', created:'2024-01-10', sla:'2024-04-10', evCount:14 },
    { id:'CASE-2024-002', title:'Child Exploitation Material',   type:'Child Exploitation',fir:'FIR/2024/002',inv:'SI Nair',       court:'POCSO Court KL',      priority:'critical', status:'under investigation', created:'2024-01-15', sla:'2024-03-15', evCount:22 },
    { id:'CASE-2024-003', title:'Corporate Data Theft',          type:'Data Theft',       fir:'FIR/2024/003', inv:'Insp. Verma',   court:'Sessions Court MH',   priority:'high',     status:'pending review',      created:'2024-02-01', sla:'2024-05-01', evCount:9  },
    { id:'CASE-2024-004', title:'Ransomware Attack – Hospital',  type:'Cybercrime',       fir:'FIR/2024/004', inv:'SI Gupta',      court:'Cyber Court TN',      priority:'critical', status:'open',                created:'2024-02-10', sla:'2024-03-10', evCount:6  },
    { id:'CASE-2024-005', title:'Social Media Defamation',       type:'Cybercrime',       fir:'FIR/2024/005', inv:'ASI Patel',     court:'Magistrate Court GJ', priority:'medium',   status:'open',                created:'2024-02-20', sla:'2024-06-20', evCount:3  },
    { id:'CASE-2024-006', title:'Drug Trafficking via DarkWeb',  type:'Drug Trafficking', fir:'FIR/2024/006', inv:'Insp. Sharma',  court:'NIA Court DL',        priority:'critical', status:'under investigation', created:'2024-02-25', sla:'2024-04-25', evCount:31 },
    { id:'CASE-2024-007', title:'Credit Card Cloning Ring',      type:'Financial Fraud',  fir:'FIR/2024/007', inv:'Insp. Verma',   court:'CBI Court MH',        priority:'high',     status:'pending review',      created:'2024-03-01', sla:'2024-05-30', evCount:18 },
    { id:'CASE-2024-008', title:'Phishing Campaign – PSU Bank',  type:'Cybercrime',       fir:'FIR/2024/008', inv:'SI Nair',       court:'Cyber Court KL',      priority:'high',     status:'under investigation', created:'2024-03-05', sla:'2024-05-05', evCount:11 },
    { id:'CASE-2024-009', title:'Identity Theft – Aadhaar Misuse',type:'Identity Theft',  fir:'FIR/2024/009', inv:'ASI Patel',     court:'District Court RJ',   priority:'medium',   status:'open',                created:'2024-03-10', sla:'2024-07-10', evCount:5  },
    { id:'CASE-2024-010', title:'Cyber Terrorism Attempt',       type:'Terrorism',        fir:'FIR/2024/010', inv:'Insp. Sharma',  court:'NIA Court DL',        priority:'critical', status:'under investigation', created:'2024-03-12', sla:'2024-04-12', evCount:27 },
    { id:'CASE-2024-011', title:'Email Spoofing – Govt Official',type:'Cybercrime',       fir:'FIR/2024/011', inv:'SI Gupta',      court:'Cyber Court UP',      priority:'high',     status:'pending review',      created:'2024-03-14', sla:'2024-06-14', evCount:7  },
    { id:'CASE-2024-012', title:'CCTV Tampering – Robbery',      type:'Data Theft',       fir:'FIR/2024/012', inv:'Insp. Verma',   court:'Sessions Court DL',   priority:'high',     status:'open',                created:'2024-03-18', sla:'2024-06-18', evCount:4  },
    { id:'CASE-2023-089', title:'Cryptocurrency Fraud',          type:'Financial Fraud',  fir:'FIR/2023/089', inv:'SI Nair',       court:'CBI Court TN',        priority:'medium',   status:'closed',              created:'2023-11-01', sla:'2024-02-01', evCount:19 },
    { id:'CASE-2023-076', title:'Mobile App Data Breach',        type:'Data Theft',       fir:'FIR/2023/076', inv:'Insp. Sharma',  court:'Cyber Court MH',      priority:'high',     status:'closed',              created:'2023-10-05', sla:'2024-01-05', evCount:12 },
    { id:'CASE-2023-054', title:'ATM Skimming Network',          type:'Financial Fraud',  fir:'FIR/2023/054', inv:'SI Gupta',      court:'CBI Court GJ',        priority:'critical', status:'archived',            created:'2023-07-22', sla:'2023-10-22', evCount:41 }
];

// ── Evidence ──────────────────────────────────────────────────────
const EVIDENCE_DATA = [
    { id:'EV-2024-001', caseId:'CASE-2024-001', type:'Hard Disk',   desc:'500GB SATA HDD – Accused Laptop',       size:'500 GB', hash:'a1b2c3d4e5f6789012345678', analyst:'Rajan K.',    status:'analysed',       received:'2024-01-12' },
    { id:'EV-2024-002', caseId:'CASE-2024-001', type:'Mobile Phone',desc:'Redmi Note 11 – SIM Card included',     size:'1 Unit', hash:'b2c3d4e5f678901234567890', analyst:'Priya S.',    status:'under analysis', received:'2024-01-13' },
    { id:'EV-2024-003', caseId:'CASE-2024-002', type:'Image File',  desc:'Forensic Image of USB Drive',           size:'32 GB',  hash:'c3d4e5f67890123456789012', analyst:'Arun M.',     status:'analysed',       received:'2024-01-16' },
    { id:'EV-2024-004', caseId:'CASE-2024-002', type:'CDR',         desc:'Mobile CDR – 6 months records',         size:'4.2 MB', hash:'d4e5f6789012345678901234', analyst:'Priya S.',    status:'analysed',       received:'2024-01-17' },
    { id:'EV-2024-005', caseId:'CASE-2024-003', type:'Video File',  desc:'CCTV Recording – 8 hours footage',      size:'12.4 GB',hash:'e5f67890123456789012345',  analyst:'Rajan K.',    status:'under analysis', received:'2024-02-03' },
    { id:'EV-2024-006', caseId:'CASE-2024-004', type:'Hard Disk',   desc:'Server HDD – Hospital Network Server',  size:'2 TB',   hash:'f6789012345678901234567',   analyst:'Arun M.',     status:'received',       received:'2024-02-12' },
    { id:'EV-2024-007', caseId:'CASE-2024-004', type:'Document',    desc:'Network Topology Map – PDF',            size:'2.1 MB', hash:'78901234567890123456789',   analyst:'Kavya R.',    status:'analysed',       received:'2024-02-13' },
    { id:'EV-2024-008', caseId:'CASE-2024-005', type:'Audio File',  desc:'Recorded Phone Call – WhatsApp',        size:'18 MB',  hash:'890123456789012345678901',  analyst:'Priya S.',    status:'under analysis', received:'2024-02-22' },
    { id:'EV-2024-009', caseId:'CASE-2024-006', type:'Mobile Phone',desc:'iPhone 14 – Encrypted',                 size:'1 Unit', hash:'9012345678901234567890123', analyst:'Rajan K.',    status:'received',       received:'2024-02-27' },
    { id:'EV-2024-010', caseId:'CASE-2024-006', type:'Hard Disk',   desc:'Tails OS USB – 64GB',                   size:'64 GB',  hash:'0123456789012345678901234', analyst:'Arun M.',     status:'analysed',       received:'2024-02-28' },
    { id:'EV-2024-011', caseId:'CASE-2024-007', type:'CDR',         desc:'Bank Transaction Logs – CSV Export',   size:'8.7 MB', hash:'12345678901234567890123456', analyst:'Kavya R.',   status:'analysed',       received:'2024-03-02' },
    { id:'EV-2024-012', caseId:'CASE-2024-010', type:'Document',    desc:'Email Headers & PCAP Logs',             size:'340 MB', hash:'23456789012345678901234567', analyst:'Rajan K.',   status:'submitted',      received:'2024-03-14' }
];

// ── Evidence Type Distribution ────────────────────────────────────
const EVIDENCE_TYPES = [
    { name:'Hard Disk',   count:34, pct:28, color:'#1f6feb' },
    { name:'Mobile Phone',count:28, pct:23, color:'#3fb950' },
    { name:'Image File',  count:22, pct:18, color:'#d29922' },
    { name:'Video File',  count:16, pct:13, color:'#f85149' },
    { name:'CDR',         count:12, pct:10, color:'#79c0ff' },
    { name:'Document',    count:8,  pct:6,  color:'#8b949e' },
    { name:'Audio File',  count:2,  pct:2,  color:'#bc8cff' }
];

// ── Case Status for Bar Chart ─────────────────────────────────────
const CASE_STATUS_DATA = [
    { label:'Jan', open:8,  investigation:12, review:5, closed:14 },
    { label:'Feb', open:11, investigation:15, review:7, closed:10 },
    { label:'Mar', open:14, investigation:18, review:9, closed:12 },
    { label:'Apr', open:9,  investigation:14, review:6, closed:16 },
    { label:'May', open:13, investigation:20, review:8, closed:18 },
    { label:'Jun', open:10, investigation:16, review:7, closed:15 },
    { label:'Jul', open:16, investigation:22, review:10,closed:20 },
    { label:'Aug', open:12, investigation:19, review:8, closed:17 },
    { label:'Sep', open:18, investigation:24, review:12,closed:22 },
    { label:'Oct', open:15, investigation:21, review:9, closed:19 },
    { label:'Nov', open:20, investigation:28, review:14,closed:24 },
    { label:'Dec', open:17, investigation:25, review:11,closed:21 }
];

// ── Monthly Case Intake ───────────────────────────────────────────
const MONTHLY_CASES = [14,18,22,16,24,20,28,23,32,27,36,31];
const MONTHLY_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── SLA Rules ─────────────────────────────────────────────────────
const SLA_RULES = [
    { id:'SLA-001', type:'Terrorism',         priority:'Critical', days:30,  warn:80, action:'Auto-Escalate + SMS Alert',  status:'active' },
    { id:'SLA-002', type:'Child Exploitation',priority:'Critical', days:30,  warn:80, action:'Auto-Escalate + Email',      status:'active' },
    { id:'SLA-003', type:'Financial Fraud',   priority:'High',     days:60,  warn:75, action:'Email Notification',         status:'active' },
    { id:'SLA-004', type:'Cybercrime',        priority:'High',     days:60,  warn:75, action:'Email + SMS',                status:'active' },
    { id:'SLA-005', type:'Data Theft',        priority:'Medium',   days:90,  warn:70, action:'Email Notification',         status:'active' },
    { id:'SLA-006', type:'Identity Theft',    priority:'Medium',   days:90,  warn:70, action:'Email Notification',         status:'active' },
    { id:'SLA-007', type:'Drug Trafficking',  priority:'Critical', days:45,  warn:80, action:'Auto-Escalate + SMS + Email',status:'active' },
    { id:'SLA-008', type:'General',           priority:'Low',      days:180, warn:60, action:'Email Notification',         status:'active' }
];

// ── SLA Performance ────────────────────────────────────────────────
const SLA_PERFORMANCE = [
    { type:'Terrorism',    compliant:85, warning:10, breached:5  },
    { type:'Financial',    compliant:78, warning:14, breached:8  },
    { type:'Cybercrime',   compliant:82, warning:12, breached:6  },
    { type:'Data Theft',   compliant:90, warning:7,  breached:3  },
    { type:'Child Expl.',  compliant:88, warning:9,  breached:3  },
    { type:'Drug',         compliant:74, warning:18, breached:8  }
];

// ── SLA Breach Alerts ─────────────────────────────────────────────
const SLA_ALERTS = [
    { caseId:'CASE-2024-004', title:'Ransomware – Hospital', dueIn:-3,  sev:'breached', inv:'SI Gupta'     },
    { caseId:'CASE-2024-002', title:'Child Exploitation',    dueIn:-1,  sev:'breached', inv:'SI Nair'      },
    { caseId:'CASE-2024-010', title:'Cyber Terrorism',       dueIn:2,   sev:'warning',  inv:'Insp. Sharma' },
    { caseId:'CASE-2024-001', title:'Online Banking Fraud',  dueIn:5,   sev:'warning',  inv:'Insp. Sharma' },
    { caseId:'CASE-2024-006', title:'DarkWeb Drug Traffic',  dueIn:8,   sev:'warning',  inv:'Insp. Sharma' },
    { caseId:'CASE-2024-011', title:'Email Spoofing',        dueIn:14,  sev:'compliant',inv:'SI Gupta'     }
];

// ── Chain of Custody ──────────────────────────────────────────────
const CUSTODY_DATA = [
    { evId:'EV-2024-001', caseId:'CASE-2024-001', action:'Received',       from:'Crime Scene Team', to:'Evidence Room',      datetime:'2024-01-12 09:30', reason:'Initial seizure',        seal:'Yes' },
    { evId:'EV-2024-001', caseId:'CASE-2024-001', action:'Transferred',    from:'Evidence Room',    to:'Forensic Lab',       datetime:'2024-01-13 10:00', reason:'Forensic analysis',      seal:'Yes' },
    { evId:'EV-2024-001', caseId:'CASE-2024-001', action:'Under Analysis', from:'Forensic Lab',     to:'Analyst: Rajan K.',  datetime:'2024-01-14 09:00', reason:'Disk imaging & analysis',seal:'Yes' },
    { evId:'EV-2024-001', caseId:'CASE-2024-001', action:'Report Filed',   from:'Analyst: Rajan K.',to:'Forensic Lab',       datetime:'2024-01-25 16:30', reason:'Analysis complete',      seal:'Yes' },
    { evId:'EV-2024-001', caseId:'CASE-2024-001', action:'Submitted',      from:'Forensic Lab',     to:'Investigating Officer',datetime:'2024-01-26 11:00',reason:'Court submission',       seal:'Yes' },
    { evId:'EV-2024-003', caseId:'CASE-2024-002', action:'Received',       from:'Crime Scene',      to:'Evidence Room',      datetime:'2024-01-16 14:00', reason:'Seized from accused',    seal:'Yes' },
    { evId:'EV-2024-003', caseId:'CASE-2024-002', action:'Transferred',    from:'Evidence Room',    to:'Digital Forensic Lab',datetime:'2024-01-17 09:30',reason:'Forensic imaging',       seal:'Yes' },
    { evId:'EV-2024-003', caseId:'CASE-2024-002', action:'Under Analysis', from:'Digital Forensic Lab','to':'Analyst: Arun M.',datetime:'2024-01-18 10:00',reason:'Data extraction',        seal:'Yes' }
];

// ── Analysis Reports ───────────────────────────────────────────────
const REPORTS_DATA = [
    { id:'RPT-2024-001', caseId:'CASE-2024-001', title:'Hard Disk Forensic Report',        analyst:'Rajan K.',  type:'Forensic Analysis',  date:'2024-01-25', size:'4.2 MB', status:'approved'  },
    { id:'RPT-2024-002', caseId:'CASE-2024-002', title:'USB Drive Analysis Report',         analyst:'Arun M.',   type:'Forensic Analysis',  date:'2024-01-28', size:'2.8 MB', status:'approved'  },
    { id:'RPT-2024-003', caseId:'CASE-2024-002', title:'CDR Analysis – Call Mapping',       analyst:'Priya S.',  type:'Network Analysis',   date:'2024-01-30', size:'1.4 MB', status:'approved'  },
    { id:'RPT-2024-004', caseId:'CASE-2024-004', title:'Ransomware Malware Analysis',       analyst:'Kavya R.',  type:'Malware Analysis',   date:'2024-02-18', size:'5.6 MB', status:'pending review' },
    { id:'RPT-2024-005', caseId:'CASE-2024-006', title:'Dark Web Activity Trace Report',   analyst:'Rajan K.',  type:'Network Analysis',   date:'2024-03-02', size:'3.1 MB', status:'approved'  },
    { id:'RPT-2024-006', caseId:'CASE-2024-007', title:'Financial Transaction Analysis',   analyst:'Kavya R.',  type:'Forensic Analysis',  date:'2024-03-08', size:'2.2 MB', status:'pending review' },
    { id:'RPT-2024-007', caseId:'CASE-2024-010', title:'Email Header & PCAP Analysis',     analyst:'Rajan K.',  type:'Network Analysis',   date:'2024-03-18', size:'6.4 MB', status:'approved'  },
    { id:'RPT-2024-008', caseId:'CASE-2024-003', title:'Mobile Forensics – Final Report',  analyst:'Priya S.',  type:'Mobile Forensics',   date:'2024-03-20', size:'3.8 MB', status:'approved'  }
];

// ── Notifications ──────────────────────────────────────────────────
const NOTIFICATIONS_DATA = [
    { id:1,  type:'sla',      icon:'⏰', title:'SLA Breach – CASE-2024-004',              body:'Ransomware Attack case has breached SLA deadline by 3 days. Immediate action required.',        time:'10 min ago',  unread:true  },
    { id:2,  type:'evidence', icon:'🗂️', title:'New Evidence Uploaded – CASE-2024-010',   body:'12 new evidence items have been uploaded for Cyber Terrorism case by Insp. Sharma.',           time:'25 min ago',  unread:true  },
    { id:3,  type:'sla',      icon:'⚠️', title:'SLA Warning – CASE-2024-010',             body:'Cyber Terrorism case SLA deadline in 2 days. Escalation triggered.',                          time:'1 hr ago',    unread:true  },
    { id:4,  type:'case',     icon:'📁', title:'Case Status Updated – CASE-2024-007',     body:'Status changed from "Open" to "Under Investigation" by Insp. Verma.',                         time:'2 hrs ago',   unread:true  },
    { id:5,  type:'evidence', icon:'🔬', title:'Analysis Complete – EV-2024-007',         body:'Network Topology Map analysis completed by Kavya R. Report ready for review.',                time:'3 hrs ago',   unread:false },
    { id:6,  type:'system',   icon:'🔒', title:'User Login Alert',                        body:'New login detected from IP 192.168.1.45 for user analyst_02. Location: Delhi.',               time:'4 hrs ago',   unread:false },
    { id:7,  type:'case',     icon:'✅', title:'Case Closed – CASE-2023-089',             body:'Cryptocurrency Fraud case has been marked as Closed. Final report submitted to court.',       time:'Yesterday',   unread:false },
    { id:8,  type:'evidence', icon:'⬆️', title:'Evidence Integrity Check',               body:'Automated integrity check completed. All 1,842 evidence hashes verified. 0 mismatches found.', time:'Yesterday',  unread:false },
    { id:9,  type:'system',   icon:'📊', title:'Monthly Report Generated',               body:'March 2024 monthly report has been auto-generated and sent to all supervisors.',               time:'2 days ago',  unread:false },
    { id:10, type:'sla',      icon:'⏱️', title:'SLA Compliance Report',                  body:'Overall SLA compliance this month: 87.4%. 12 cases breached, 19 in warning state.',          time:'3 days ago',  unread:false }
];

// ── Users ──────────────────────────────────────────────────────────
const USERS_DATA = [
    { id:1,  name:'Supt. Ramesh Prasad',   uname:'admin',        role:'Super Admin',      authLevel:1, dept:'HQ',                lastLogin:'Just now',     status:'active'   },
    { id:2,  name:'Insp. A. Sharma',       uname:'insp_sharma',  role:'Investigator',     authLevel:2, dept:'Cyber Crime Unit',  lastLogin:'1 hr ago',     status:'active'   },
    { id:3,  name:'Insp. V. Verma',        uname:'insp_verma',   role:'Investigator',     authLevel:2, dept:'Financial Fraud',   lastLogin:'2 hrs ago',    status:'active'   },
    { id:4,  name:'SI P. Nair',            uname:'si_nair',      role:'Investigator',     authLevel:2, dept:'Cyber Crime Unit',  lastLogin:'3 hrs ago',    status:'active'   },
    { id:5,  name:'SI M. Gupta',           uname:'si_gupta',     role:'Investigator',     authLevel:2, dept:'Terrorism Cell',    lastLogin:'4 hrs ago',    status:'active'   },
    { id:6,  name:'ASI R. Patel',          uname:'asi_patel',    role:'Investigator',     authLevel:2, dept:'Regional Office',   lastLogin:'Yesterday',    status:'active'   },
    { id:7,  name:'Rajan K.',              uname:'analyst_rajan',role:'Forensic Analyst', authLevel:3, dept:'Digital Forensics', lastLogin:'1 hr ago',     status:'active'   },
    { id:8,  name:'Priya S.',              uname:'analyst_priya',role:'Forensic Analyst', authLevel:3, dept:'Digital Forensics', lastLogin:'2 hrs ago',    status:'active'   },
    { id:9,  name:'Arun M.',               uname:'analyst_arun', role:'Forensic Analyst', authLevel:3, dept:'Digital Forensics', lastLogin:'3 hrs ago',    status:'active'   },
    { id:10, name:'Kavya R.',              uname:'analyst_kavya',role:'Forensic Analyst', authLevel:3, dept:'Audio/Video Lab',   lastLogin:'4 hrs ago',    status:'active'   },
    { id:11, name:'Dr. S. Menon',          uname:'supervisor',   role:'Supervisor',       authLevel:2, dept:'Forensics',         lastLogin:'Yesterday',    status:'active'   },
    { id:12, name:'Adv. P. Kumar',         uname:'court_view',   role:'Court User',       authLevel:4, dept:'Judiciary',         lastLogin:'3 days ago',   status:'active'   },
    { id:13, name:'Agency Liaison (CBI)',  uname:'ext_agency',   role:'External Agency',  authLevel:5, dept:'CBI',               lastLogin:'1 week ago',   status:'inactive' }
];

// ── Auth Levels ───────────────────────────────────────────────────
const AUTH_LEVELS = [
    { level:1, color:'#f85149', label:'Level 1 – Super Admin',    title:'Super Administrator',  perms:'Full access: all cases, users, config, audit, reports' },
    { level:2, color:'#d29922', label:'Level 2 – Investigator',   title:'Investigating Officer',perms:'Create/manage cases, upload evidence, view reports, chain of custody' },
    { level:3, color:'#388bfd', label:'Level 3 – Analyst',        title:'Forensic Analyst',     perms:'Access assigned evidence, upload analysis reports, view case details' },
    { level:4, color:'#3fb950', label:'Level 4 – Court User',     title:'Judiciary / Court',    perms:'View-only access to approved reports and submitted evidence' },
    { level:5, color:'#8b949e', label:'Level 5 – External Agency',title:'Partner Agency',       perms:'Limited view of shared cases and evidence with approval' }
];

// ── Audit Log ─────────────────────────────────────────────────────
const AUDIT_DATA = [
    { id:1,  ts:'2024-03-20 10:42:11', user:'insp_sharma',  action:'Evidence Uploaded',    module:'Evidence',  record:'EV-2024-012', ip:'192.168.1.22', result:'Success' },
    { id:2,  ts:'2024-03-20 10:38:04', user:'analyst_rajan',action:'Report Submitted',     module:'Reports',   record:'RPT-2024-007',ip:'192.168.1.31', result:'Success' },
    { id:3,  ts:'2024-03-20 10:30:22', user:'admin',        action:'User Created',          module:'Users',     record:'USR-013',      ip:'192.168.1.10', result:'Success' },
    { id:4,  ts:'2024-03-20 10:22:15', user:'insp_verma',   action:'Case Status Updated',  module:'Cases',     record:'CASE-2024-007',ip:'192.168.1.24', result:'Success' },
    { id:5,  ts:'2024-03-20 10:15:08', user:'si_nair',      action:'Evidence Accessed',     module:'Evidence',  record:'EV-2024-003',  ip:'192.168.1.33', result:'Success' },
    { id:6,  ts:'2024-03-20 10:08:55', user:'analyst_priya',action:'Analysis Started',     module:'Evidence',  record:'EV-2024-008',  ip:'192.168.1.32', result:'Success' },
    { id:7,  ts:'2024-03-20 09:55:44', user:'court_view',   action:'Report Downloaded',    module:'Reports',   record:'RPT-2024-001', ip:'10.0.0.45',    result:'Success' },
    { id:8,  ts:'2024-03-20 09:42:30', user:'unknown',      action:'Login Failed',          module:'Auth',      record:'—',            ip:'45.33.22.11',  result:'Failed'  },
    { id:9,  ts:'2024-03-20 09:38:12', user:'admin',        action:'SLA Rule Updated',     module:'SLA',       record:'SLA-002',      ip:'192.168.1.10', result:'Success' },
    { id:10, ts:'2024-03-20 09:25:00', user:'insp_sharma',  action:'Case Created',          module:'Cases',     record:'CASE-2024-012',ip:'192.168.1.22', result:'Success' }
];

// ── Life Cycle Steps ──────────────────────────────────────────────
const LIFECYCLE_STEPS = [
    { icon:'📥', label:'Case\nRegistered',  color:'#1f6feb', border:'#388bfd', cls:'received'  },
    { icon:'📋', label:'Evidence\nReceived',color:'#d29922', border:'#e3b341', cls:'transfer'  },
    { icon:'🔬', label:'Under\nAnalysis',   color:'#0d419d', border:'#79c0ff', cls:'analysis'  },
    { icon:'📊', label:'Report\nGenerated', color:'#196c2e', border:'#3fb950', cls:'submitted' },
    { icon:'⚖️', label:'Pending\nReview',   color:'#5a1e02', border:'#d29922', cls:'transfer'  },
    { icon:'✅', label:'Court\nSubmitted',  color:'#196c2e', border:'#39d353', cls:'submitted' },
    { icon:'🗃️', label:'Case\nClosed',      color:'#21262d', border:'#8b949e', cls:'returned'  }
];

const LIFECYCLE_STATUS = [
    { label:'Registered', count:247 },
    { label:'Evidence Received', count:231 },
    { label:'Under Analysis', count:64 },
    { label:'Report Generated', count:89 },
    { label:'Pending Review', count:28 },
    { label:'Court Submitted', count:145 },
    { label:'Closed/Archived', count:102 }
];