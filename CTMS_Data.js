/* ================================================================
   data.js  –  All mock data for CTMS Dashboard
   ================================================================ */

// ── Stat Cards ────────────────────────────────────────────────────
const STAT_CARDS = [
    { icon:'🖥️', value:'60',     label:'Active Servers',          delta:'+3',   dir:'up',   color:'blue',   key:'servers'   },
    { icon:'🔴', value:'72,035', label:'Flagged Domains',          delta:'+812', dir:'up',   color:'red',    key:'domains'   },
    { icon:'🚨', value:'11,206', label:'Flagged IPs',              delta:'+204', dir:'up',   color:'orange', key:'ips'       },
    { icon:'🦠', value:'1,402',  label:'Malware Samples',          delta:'+18',  dir:'up',   color:'red',    key:'malware'   },
    { icon:'📡', value:'683,739',label:'Scan Detections',          delta:'+5.2k',dir:'up',   color:'purple', key:'scans'     },
    { icon:'🛡️', value:'204,345',label:'Intrusions Detected',      delta:'+1.1k',dir:'up',   color:'blue',   key:'intrusions'},
    { icon:'📋', value:'102,699',label:'Commands Captured',        delta:'+930', dir:'up',   color:'green',  key:'commands'  },
    { icon:'⚠️', value:'51',     label:'Total Vulnerabilities',    delta:'-4',   dir:'down', color:'yellow', key:'vulns'     },
    { icon:'🍯', value:'18',     label:'Active Honeypots',         delta:'0',    dir:'up',   color:'green',  key:'honeypots' },
    { icon:'🌐', value:'19',     label:'Countries Monitored',      delta:'+1',   dir:'up',   color:'blue',   key:'countries' },
    { icon:'📊', value:'124,147',label:'Total Events (Today)',     delta:'+9.3k',dir:'up',   color:'purple', key:'events'    },
    { icon:'🔒', value:'13',     label:'Blocked Attack Campaigns', delta:'+2',   dir:'up',   color:'green',  key:'blocked'   }
];

// ── Malware Families ──────────────────────────────────────────────
const MALWARE_FAMILIES = [
    { name:'Trojan',        count:27, color:'#ff3b3b' },
    { name:'Ransomware',    count:22, color:'#ff8c00' },
    { name:'TrojanBanker',  count:22, color:'#ffd700' },
    { name:'TrojanBanker2', count:20, color:'#9b59b6' },
    { name:'Backdoor',      count:18, color:'#00d4ff' },
    { name:'Bot',           count:15, color:'#00ff88' },
    { name:'Spyware',       count:12, color:'#e74c3c' },
    { name:'Worm',          count:9,  color:'#3498db' }
];

// ── Sector Classification ─────────────────────────────────────────
const SECTORS = [
    { name:'Government',  pct:32.5, color:'#ff3b3b' },
    { name:'Finance',     pct:22.5, color:'#ff8c00' },
    { name:'Defence',     pct:18.5, color:'#ffd700' },
    { name:'Healthcare',  pct:12.7, color:'#00d4ff' },
    { name:'Education',   pct:8.4,  color:'#00ff88' },
    { name:'Telecom',     pct:5.4,  color:'#9b59b6' }
];

// ── Malware Type (stats page) ─────────────────────────────────────
const MALWARE_TYPES = [
    { name:'Trojan',     pct:34, color:'#ff3b3b' },
    { name:'Ransomware', pct:21, color:'#ff8c00' },
    { name:'Backdoor',   pct:16, color:'#ffd700' },
    { name:'Bot/Botnet', pct:14, color:'#00d4ff' },
    { name:'Spyware',    pct:9,  color:'#00ff88' },
    { name:'Worm',       pct:6,  color:'#9b59b6' }
];

// ── Monthly Attacks ────────────────────────────────────────────────
const MONTHLY_ATTACKS = [
    { month:'Jan', attacks:8400  },
    { month:'Feb', attacks:9200  },
    { month:'Mar', attacks:11500 },
    { month:'Apr', attacks:10800 },
    { month:'May', attacks:13200 },
    { month:'Jun', attacks:12400 },
    { month:'Jul', attacks:15600 },
    { month:'Aug', attacks:14900 },
    { month:'Sep', attacks:17200 },
    { month:'Oct', attacks:18500 },
    { month:'Nov', attacks:20100 },
    { month:'Dec', attacks:22400 }
];

// ── 24h Trend (hourly) ────────────────────────────────────────────
const TREND_24H = [
    120,98,74,62,55,70,88,140,210,280,320,290,
    260,310,380,420,390,440,510,480,390,310,250,180
];

// ── Risk Scores (attack surface) ─────────────────────────────────
const RISK_SCORES = [
    42,47,55,60,58,65,70,68,74,78,75,80,
    82,79,85,88,86,90,87,92,89,95,91,88
];

// ── Alerts ────────────────────────────────────────────────────────
const ALERTS_DATA = [
    { id:1,  time:'10:42:11', srcIp:'223.71.167.45',   target:'Gov Portal',       type:'SQL Injection',      malware:'Trojan.Agent',   severity:'critical', status:'new'     },
    { id:2,  time:'10:39:58', srcIp:'45.142.212.100',  target:'Banking Server',   type:'Brute Force',        malware:'Mirai.Bot',      severity:'critical', status:'new'     },
    { id:3,  time:'10:35:22', srcIp:'91.108.56.177',   target:'SCADA System',     type:'RCE Exploit',        malware:'Industroyer',    severity:'critical', status:'blocked' },
    { id:4,  time:'10:28:45', srcIp:'185.234.219.33',  target:'Mail Server',      type:'Phishing Payload',   malware:'Emotet',         severity:'high',     status:'new'     },
    { id:5,  time:'10:21:03', srcIp:'194.165.16.78',   target:'DNS Server',       type:'DNS Amplification',  malware:'DNS-Flood',      severity:'high',     status:'blocked' },
    { id:6,  time:'10:17:34', srcIp:'77.83.198.12',    target:'Web App Firewall', type:'XSS Attack',         malware:'BeEF Framework', severity:'high',     status:'new'     },
    { id:7,  time:'10:09:11', srcIp:'198.144.121.90',  target:'VPN Gateway',      type:'Credential Stuffing',malware:'Stealer.Gen',    severity:'medium',   status:'blocked' },
    { id:8,  time:'10:01:55', srcIp:'104.21.84.23',    target:'API Endpoint',     type:'Directory Traversal',malware:'WebShell',       severity:'medium',   status:'new'     },
    { id:9,  time:'09:55:40', srcIp:'46.161.27.200',   target:'FTP Server',       type:'Data Exfiltration',  malware:'Cobalt Strike',  severity:'critical', status:'new'     },
    { id:10, time:'09:48:22', srcIp:'31.14.40.188',    target:'IoT Gateway',      type:'Botnet C2',          malware:'Mirai.Variant',  severity:'high',     status:'blocked' },
    { id:11, time:'09:41:07', srcIp:'162.55.245.60',   target:'LDAP Server',      type:'LDAP Injection',     malware:'Generic.Trojan', severity:'medium',   status:'new'     },
    { id:12, time:'09:33:50', srcIp:'45.9.148.205',    target:'HR Portal',        type:'File Upload Attack', malware:'Webshell.PHP',   severity:'high',     status:'new'     }
];

// ── Honeypot Sensors ──────────────────────────────────────────────
const HONEYPOT_DATA = [
    { name:'HP-SSH-01',  type:'SSH Honeypot',   loc:'Mumbai, IN',   attacks:1204, status:'active', load:78 },
    { name:'HP-WEB-02',  type:'Web Server',     loc:'Delhi, IN',    attacks:876,  status:'active', load:62 },
    { name:'HP-FTP-03',  type:'FTP Service',    loc:'Chennai, IN',  attacks:445,  status:'active', load:45 },
    { name:'HP-SMB-04',  type:'SMB/Windows',    loc:'Kolkata, IN',  attacks:2108, status:'alert',  load:95 },
    { name:'HP-IOT-05',  type:'IoT Sensor',     loc:'Pune, IN',     attacks:334,  status:'active', load:38 },
    { name:'HP-DB-06',   type:'Database',       loc:'Hyderabad, IN',attacks:1567, status:'alert',  load:89 },
    { name:'HP-DNS-07',  type:'DNS Service',    loc:'Bengaluru, IN',attacks:789,  status:'active', load:55 },
    { name:'HP-MAIL-08', type:'Mail Server',    loc:'Ahmedabad, IN',attacks:290,  status:'active', load:30 },
    { name:'HP-API-09',  type:'REST API',       loc:'Jaipur, IN',   attacks:603,  status:'active', load:50 },
    { name:'HP-SCADA-10',type:'ICS/SCADA',      loc:'Nagpur, IN',   attacks:122,  status:'offline',load:0  },
    { name:'HP-VPN-11',  type:'VPN Endpoint',   loc:'Surat, IN',    attacks:988,  status:'active', load:70 },
    { name:'HP-LDAP-12', type:'LDAP Directory', loc:'Lucknow, IN',  attacks:210,  status:'active', load:25 }
];

// ── CnC Servers ───────────────────────────────────────────────────
const CNC_DATA = [
    { ip:'185.220.101.45', domain:'darknode-cc.ru',    country:'🇷🇺 Russia',     bots:3874, proto:'HTTP/S', first:'2024-10-01', last:'10 min ago', risk:98 },
    { ip:'45.142.212.100', domain:'c2panel.onion',     country:'🇺🇦 Ukraine',    bots:2310, proto:'TCP',    first:'2024-11-12', last:'2 min ago',  risk:95 },
    { ip:'91.108.56.177',  domain:'updates-win.cn',    country:'🇨🇳 China',      bots:5120, proto:'DNS',    first:'2024-09-22', last:'1 hr ago',   risk:96 },
    { ip:'62.204.41.206',  domain:'cdn-track.net',     country:'🇳🇱 Netherlands',bots:1455, proto:'HTTPS',  first:'2024-12-01', last:'5 min ago',  risk:90 },
    { ip:'194.165.16.78',  domain:'botmaster.io',      country:'🇩🇪 Germany',    bots:876,  proto:'IRC',    first:'2024-10-15', last:'30 min ago', risk:87 },
    { ip:'31.14.40.188',   domain:'loader-panel.cc',   country:'🇧🇬 Bulgaria',   bots:2200, proto:'HTTP',   first:'2024-11-28', last:'15 min ago', risk:93 },
    { ip:'77.83.198.12',   domain:'nexuspanel.xyz',    country:'🇷🇴 Romania',    bots:660,  proto:'TCP',    first:'2024-12-05', last:'1 hr ago',   risk:82 },
    { ip:'104.21.84.23',   domain:'cloud-relay.in',    country:'🇺🇸 USA',        bots:1130, proto:'HTTPS',  first:'2024-10-30', last:'20 min ago', risk:79 }
];

// ── Nodes ─────────────────────────────────────────────────────────
const NODES_DATA = [
    { name:'NODE-MUM-01', ip:'10.10.1.1',  status:'online',  cpu:'34%',  mem:'61%',  disk:'42%', events:1204, uptime:'14d 6h'  },
    { name:'NODE-DEL-02', ip:'10.10.1.2',  status:'online',  cpu:'67%',  mem:'72%',  disk:'55%', events:892,  uptime:'9d 12h'  },
    { name:'NODE-BLR-03', ip:'10.10.1.3',  status:'online',  cpu:'22%',  mem:'44%',  disk:'30%', events:437,  uptime:'22d 3h'  },
    { name:'NODE-CHN-04', ip:'10.10.1.4',  status:'offline', cpu:'0%',   mem:'0%',   disk:'78%', events:0,    uptime:'Offline' },
    { name:'NODE-HYD-05', ip:'10.10.1.5',  status:'online',  cpu:'89%',  mem:'91%',  disk:'67%', events:3210, uptime:'5d 1h'   },
    { name:'NODE-PUN-06', ip:'10.10.1.6',  status:'online',  cpu:'45%',  mem:'58%',  disk:'39%', events:680,  uptime:'18d 8h'  },
    { name:'NODE-KOL-07', ip:'10.10.1.7',  status:'online',  cpu:'31%',  mem:'50%',  disk:'47%', events:521,  uptime:'11d 4h'  },
    { name:'NODE-AMD-08', ip:'10.10.1.8',  status:'online',  cpu:'55%',  mem:'63%',  disk:'52%', events:788,  uptime:'7d 9h'   }
];

// ── Users ─────────────────────────────────────────────────────────
const USERS_DATA = [
    { id:1, username:'admin',       role:'Super Admin',    lastLogin:'Just now',     status:'active'   },
    { id:2, username:'analyst_01',  role:'SOC Analyst',    lastLogin:'2 hrs ago',    status:'active'   },
    { id:3, username:'analyst_02',  role:'SOC Analyst',    lastLogin:'5 hrs ago',    status:'active'   },
    { id:4, username:'manager_sec', role:'Security Mgr',   lastLogin:'1 day ago',    status:'active'   },
    { id:5, username:'viewer_01',   role:'Read-Only',      lastLogin:'3 days ago',   status:'inactive' },
    { id:6, username:'auditor',     role:'Auditor',        lastLogin:'1 week ago',   status:'active'   }
];

// ── Reports ───────────────────────────────────────────────────────
const REPORTS_DATA = [
    { icon:'📊', title:'Daily Threat Report',       desc:'Comprehensive summary of all threats detected in the last 24 hours.',    size:'2.4 MB',  date:'Today, 06:00',     type:'PDF'  },
    { icon:'🦠', title:'Malware Analysis Report',   desc:'Detailed analysis of malware samples captured by honeypot sensors.',     size:'5.1 MB',  date:'Today, 06:00',     type:'PDF'  },
    { icon:'🗺️', title:'Geo-Threat Intelligence',   desc:'Geographic distribution of attacks with source country analysis.',       size:'3.7 MB',  date:'Yesterday',        type:'PDF'  },
    { icon:'🍯', title:'Honeypot Activity Report',  desc:'Full log of all activity recorded across all active honeypot sensors.',  size:'8.2 MB',  date:'Yesterday',        type:'PDF'  },
    { icon:'🏢', title:'Sector Impact Report',      desc:'Sector-wise breakdown of attacks targeting critical infrastructure.',    size:'1.9 MB',  date:'2 days ago',       type:'PDF'  },
    { icon:'🔍', title:'C&C Infrastructure Report', desc:'Identified command & control servers, bots and campaign analysis.',      size:'4.3 MB',  date:'Weekly – Monday',  type:'PDF'  },
    { icon:'⚠️', title:'Vulnerability Assessment',  desc:'Current attack surface enumeration and risk scoring per node.',         size:'3.1 MB',  date:'Weekly – Monday',  type:'PDF'  },
    { icon:'📈', title:'Monthly Executive Report',  desc:'High-level executive summary suitable for management review.',           size:'6.8 MB',  date:'Monthly',          type:'PDF'  }
];

// ── Attack Types for live feed ────────────────────────────────────
const ATTACK_TYPES = [
    'SQL Injection','XSS Attack','Brute Force','Port Scan',
    'DDoS Attempt','Phishing','RCE Exploit','Malware Upload',
    'Credential Stuffing','DNS Amplification','Botnet C2',
    'Directory Traversal','LDAP Injection','File Inclusion'
];

const COUNTRIES = [
    { name:'Russia',      flag:'🇷🇺', x:0.63, y:0.25 },
    { name:'China',       flag:'🇨🇳', x:0.77, y:0.38 },
    { name:'USA',         flag:'🇺🇸', x:0.18, y:0.35 },
    { name:'Brazil',      flag:'🇧🇷', x:0.30, y:0.62 },
    { name:'Germany',     flag:'🇩🇪', x:0.52, y:0.26 },
    { name:'Ukraine',     flag:'🇺🇦', x:0.59, y:0.27 },
    { name:'North Korea', flag:'🇰🇵', x:0.80, y:0.32 },
    { name:'Iran',        flag:'🇮🇷', x:0.63, y:0.38 },
    { name:'Netherlands', flag:'🇳🇱', x:0.51, y:0.24 },
    { name:'India',       flag:'🇮🇳', x:0.70, y:0.42 }
];

const SEVERITIES  = ['critical','critical','high','high','medium','low'];
const TARGET_NAMES = [
    'Gov Portal','Banking Server','SCADA System','Mail Server',
    'DNS Server','VPN Gateway','API Endpoint','FTP Server',
    'IoT Gateway','HR Portal','LDAP Server','Web App'
];