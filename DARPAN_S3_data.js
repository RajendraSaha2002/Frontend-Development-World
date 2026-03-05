/* ================================================================
   data.js – All mock data for DARPAN S3 NMS Dashboard
   C-DAC Cyber Security Group
   ================================================================ */

// ── Dashboard Stat Cards ─────────────────────────────────────────
const DASH_STATS = [
    {ico:'🖧', val:'248', lbl:'Managed Devices',   tr:'+6',  dir:'up',   col:'blue'  },
    {ico:'🟢', val:'231', lbl:'Devices Up',         tr:'+4',  dir:'up',   col:'green' },
    {ico:'🔴', val:'8',   lbl:'Devices Down',        tr:'+2',  dir:'up',   col:'red'   },
    {ico:'🟡', val:'9',   lbl:'Degraded',            tr:'-1',  dir:'down', col:'orange'},
    {ico:'🚨', val:'42',  lbl:'Active Alarms',       tr:'+7',  dir:'up',   col:'red'   },
    {ico:'☁️', val:'3',   lbl:'Cloud Platforms',     tr:'0',   dir:'up',   col:'purple'},
    {ico:'🔀', val:'12',  lbl:'MPLS VPNs',           tr:'+1',  dir:'up',   col:'teal'  },
    {ico:'📊', val:'98.6%',lbl:'Network Availability',tr:'+.2%',dir:'up', col:'green' },
    {ico:'🌊', val:'4.2Gbps',lbl:'Total Throughput',tr:'+300M',dir:'up',  col:'blue'  },
    {ico:'⏱️', val:'94.2%',lbl:'SLA Compliance',    tr:'-1.2%',dir:'down',col:'orange'},
    {ico:'🎫', val:'17',  lbl:'Open Tickets',        tr:'+3',  dir:'up',   col:'orange'},
    {ico:'🔒', val:'6',   lbl:'Security Incidents',  tr:'+1',  dir:'up',   col:'red'   }
];

// ── Devices ──────────────────────────────────────────────────────
const DEVICES = [
    {name:'CORE-RTR-01',   ip:'10.0.0.1',   type:'Router',       vendor:'Cisco',    model:'ASR-9001',    os:'IOS-XR 7.3',  loc:'DC-Mumbai',     domain:'Core',    status:'up',       cpu:34, mem:62, uptime:'127d 4h', proto:'SNMPv3'},
    {name:'CORE-RTR-02',   ip:'10.0.0.2',   type:'Router',       vendor:'Juniper',  model:'MX-480',      os:'JUNOS 21.4',  loc:'DC-Mumbai',     domain:'Core',    status:'up',       cpu:41, mem:58, uptime:'127d 4h', proto:'SNMPv3'},
    {name:'DIST-SW-01',    ip:'10.1.0.1',   type:'Switch',       vendor:'Cisco',    model:'Cat-9500',    os:'IOS-XE 17.6', loc:'Bldg-A Floor1', domain:'LAN',     status:'up',       cpu:22, mem:44, uptime:'85d 12h', proto:'SNMPv2'},
    {name:'DIST-SW-02',    ip:'10.1.0.2',   type:'Switch',       vendor:'HP',       model:'Aruba-8400',  os:'AOS-CX 10.9', loc:'Bldg-B Floor2', domain:'LAN',     status:'up',       cpu:19, mem:38, uptime:'85d 12h', proto:'SNMPv2'},
    {name:'ACC-SW-01',     ip:'10.2.0.1',   type:'Switch',       vendor:'Cisco',    model:'Cat-3850',    os:'IOS-XE 16.12',loc:'Bldg-A Floor2', domain:'LAN',     status:'up',       cpu:12, mem:28, uptime:'200d 6h', proto:'SNMPv2'},
    {name:'EDGE-FW-01',    ip:'192.168.1.1',type:'Firewall',      vendor:'Palo Alto',model:'PA-5250',     os:'PAN-OS 10.2', loc:'DMZ',           domain:'Security',status:'up',       cpu:55, mem:70, uptime:'60d 8h',  proto:'SNMPv3'},
    {name:'WAN-RTR-01',    ip:'172.16.0.1', type:'Router',       vendor:'Cisco',    model:'ISR-4451',    os:'IOS-XE 17.3', loc:'WAN-Edge',      domain:'WAN',     status:'up',       cpu:67, mem:75, uptime:'45d 3h',  proto:'SNMPv3'},
    {name:'WAN-RTR-02',    ip:'172.16.0.2', type:'Router',       vendor:'Cisco',    model:'ISR-4351',    os:'IOS-XE 17.3', loc:'Branch-Delhi',  domain:'WAN',     status:'degraded', cpu:88, mem:91, uptime:'45d 3h',  proto:'SNMPv3'},
    {name:'APP-SRV-01',    ip:'10.10.1.1',  type:'Server',       vendor:'Dell',     model:'R750',        os:'RHEL 8.5',    loc:'DC-Mumbai',     domain:'Servers', status:'up',       cpu:45, mem:68, uptime:'180d 2h', proto:'SNMPv2'},
    {name:'DB-SRV-01',     ip:'10.10.1.2',  type:'Server',       vendor:'HP',       model:'DL380 Gen10', os:'Ubuntu 20.04',loc:'DC-Mumbai',     domain:'Servers', status:'up',       cpu:38, mem:74, uptime:'180d 2h', proto:'SNMPv2'},
    {name:'WLAN-CTRL-01',  ip:'10.5.0.1',   type:'AP',           vendor:'Cisco',    model:'WLC-9800',    os:'IOS-XE 17.6', loc:'Bldg-A',        domain:'WLAN',    status:'up',       cpu:31, mem:55, uptime:'90d 0h',  proto:'SNMPv2'},
    {name:'LB-01',         ip:'10.3.0.1',   type:'Load Balancer',vendor:'F5',       model:'BIG-IP-2200', os:'TMOS 15.1',   loc:'DMZ',           domain:'DMZ',     status:'up',       cpu:24, mem:48, uptime:'120d 5h', proto:'SNMPv3'},
    {name:'PE-RTR-01',     ip:'172.20.0.1', type:'Router',       vendor:'Cisco',    model:'ASR-1002',    os:'IOS-XE 17.5', loc:'MPLS-Edge',     domain:'MPLS',    status:'up',       cpu:52, mem:66, uptime:'200d 1h', proto:'SNMPv3'},
    {name:'PE-RTR-02',     ip:'172.20.0.2', type:'Router',       vendor:'Juniper',  model:'MX-204',      os:'JUNOS 21.4',  loc:'MPLS-Edge',     domain:'MPLS',    status:'up',       cpu:48, mem:61, uptime:'200d 1h', proto:'SNMPv3'},
    {name:'BRANCH-RTR-01', ip:'10.50.0.1',  type:'Router',       vendor:'Cisco',    model:'ISR-1100',    os:'IOS-XE 17.3', loc:'Branch-Pune',   domain:'Branch',  status:'down',     cpu:0,  mem:0,  uptime:'Down',    proto:'SNMPv2'},
    {name:'IDC-FW-01',     ip:'10.0.1.1',   type:'Firewall',     vendor:'Fortinet', model:'FG-2000E',    os:'FortiOS 7.2', loc:'IDC',           domain:'Security',status:'up',       cpu:61, mem:72, uptime:'90d 11h', proto:'SNMPv3'}
];

// ── Topology Links ────────────────────────────────────────────────
const LINKS = [
    {id:'LNK-001', src:'CORE-RTR-01', dst:'DIST-SW-01',   type:'Fiber', speed:'10Gbps',  util:34,  latency:'0.5ms',  status:'up'},
    {id:'LNK-002', src:'CORE-RTR-01', dst:'DIST-SW-02',   type:'Fiber', speed:'10Gbps',  util:28,  latency:'0.5ms',  status:'up'},
    {id:'LNK-003', src:'CORE-RTR-02', dst:'DIST-SW-01',   type:'Fiber', speed:'10Gbps',  util:41,  latency:'0.5ms',  status:'up'},
    {id:'LNK-004', src:'CORE-RTR-01', dst:'EDGE-FW-01',   type:'Fiber', speed:'10Gbps',  util:55,  latency:'0.8ms',  status:'up'},
    {id:'LNK-005', src:'EDGE-FW-01',  dst:'WAN-RTR-01',   type:'MPLS',  speed:'1Gbps',   util:67,  latency:'2.1ms',  status:'up'},
    {id:'LNK-006', src:'WAN-RTR-01',  dst:'WAN-RTR-02',   type:'MPLS',  speed:'1Gbps',   util:88,  latency:'15.4ms', status:'degraded'},
    {id:'LNK-007', src:'DIST-SW-01',  dst:'ACC-SW-01',    type:'Copper',speed:'1Gbps',   util:22,  latency:'0.3ms',  status:'up'},
    {id:'LNK-008', src:'CORE-RTR-01', dst:'PE-RTR-01',    type:'MPLS',  speed:'10Gbps',  util:44,  latency:'1.2ms',  status:'up'},
    {id:'LNK-009', src:'BRANCH-RTR-01','dst':'PE-RTR-02', type:'MPLS',  speed:'100Mbps', util:0,   latency:'—',       status:'down'},
    {id:'LNK-010', src:'CORE-RTR-01', dst:'LB-01',        type:'Fiber', speed:'10Gbps',  util:31,  latency:'0.4ms',  status:'up'}
];

// ── Faults / Alarms ───────────────────────────────────────────────
const FAULTS = [
    {id:'ALM-001',time:'10:42:11',dev:'BRANCH-RTR-01',ip:'10.50.0.1',sev:'critical',cat:'Availability',desc:'Node unreachable – Interface GE0/0/0 down',root:'Link failure at WAN edge',status:'active'},
    {id:'ALM-002',time:'10:38:04',dev:'WAN-RTR-02',   ip:'172.16.0.2',sev:'major',  cat:'Performance',desc:'CPU utilization above 85% threshold',root:'High routing table churn',status:'active'},
    {id:'ALM-003',time:'10:31:22',dev:'WAN-RTR-02',   ip:'172.16.0.2',sev:'major',  cat:'Performance',desc:'Memory utilization 91% – Critical threshold',root:'BGP route injection',status:'active'},
    {id:'ALM-004',time:'10:22:15',dev:'LNK-006',      ip:'172.16.0.1',sev:'major',  cat:'Interface', desc:'Link utilization 88% on WAN-RTR-01 → WAN-RTR-02',root:'Traffic burst from branch',status:'acknowledged'},
    {id:'ALM-005',time:'10:15:08',dev:'EDGE-FW-01',   ip:'192.168.1.1',sev:'warning',cat:'Security', desc:'Unusual outbound connection rate detected',root:'Policy anomaly – DDoS pattern',status:'active'},
    {id:'ALM-006',time:'10:08:55',dev:'APP-SRV-01',   ip:'10.10.1.1', sev:'minor',  cat:'Application',desc:'Tomcat JVM heap usage 78%',root:'Memory leak in application',status:'active'},
    {id:'ALM-007',time:'09:55:44',dev:'WLAN-CTRL-01', ip:'10.5.0.1',  sev:'warning',cat:'WLAN',     desc:'AP association failure rate > 5%',root:'RF interference',status:'acknowledged'},
    {id:'ALM-008',time:'09:42:30',dev:'CORE-RTR-01',  ip:'10.0.0.1',  sev:'info',   cat:'Config',   desc:'Configuration change detected',root:'Scheduled maintenance',status:'cleared'},
    {id:'ALM-009',time:'09:30:11',dev:'DB-SRV-01',    ip:'10.10.1.2', sev:'minor',  cat:'Database', desc:'MySQL slow query count spike',root:'Missing index on reports table',status:'active'},
    {id:'ALM-010',time:'09:15:05',dev:'IDC-FW-01',    ip:'10.0.1.1',  sev:'critical',cat:'Security','desc':'Intrusion detection: port scan from 45.33.22.11',root:'External threat actor',status:'active'}
];

// ── Traffic Flow ──────────────────────────────────────────────────
const TRAFFIC_STATS = [
    {ico:'🌐',val:'4.2 Gbps',lbl:'Total Throughput',col:'blue'},
    {ico:'⬇️',val:'2.8 Gbps',lbl:'Inbound',          col:'green'},
    {ico:'⬆️',val:'1.4 Gbps',lbl:'Outbound',          col:'teal'},
    {ico:'📦',val:'1.2M/s',  lbl:'Packets/sec',       col:'purple'},
    {ico:'🔄',val:'98.2%',   lbl:'Flow Capture Rate', col:'green'},
    {ico:'🚦',val:'18',      lbl:'Active Flows',       col:'orange'}
];

const TOP_TALKERS = [
    {src:'10.10.1.1',  dst:'203.45.67.89', proto:'HTTPS', bytes:'2.4 GB', pkts:'1.8M'},
    {src:'10.10.1.2',  dst:'10.50.0.5',    proto:'MySQL',  bytes:'1.1 GB', pkts:'900K'},
    {src:'192.168.1.50',dst:'10.0.0.1',   proto:'OSPF',   bytes:'450 MB', pkts:'380K'},
    {src:'10.2.0.45',  dst:'8.8.8.8',      proto:'DNS',    bytes:'120 MB', pkts:'2.1M'},
    {src:'172.16.0.2', dst:'172.16.0.1',   proto:'BGP',    bytes:'95 MB',  pkts:'80K' }
];

const PROTO_DIST = [
    {name:'HTTPS/TLS',pct:42,color:'#0ea5e9'},
    {name:'HTTP',     pct:18,color:'#22c55e'},
    {name:'FTP/SFTP', pct:12,color:'#f59e0b'},
    {name:'SSH',      pct:8, color:'#a855f7'},
    {name:'DNS',      pct:10,color:'#14b8a6'},
    {name:'SMTP',     pct:6, color:'#ef4444'},
    {name:'Other',    pct:4, color:'#64748b'}
];

const APP_TRAFFIC = [
    {name:'Web',   bw:1800},{name:'DB',    bw:1100},{name:'VoIP', bw:450},
    {name:'Video', bw:620}, {name:'Backup',bw:380}, {name:'Email',bw:190}
];

// ── App & DB Monitor ──────────────────────────────────────────────
const APP_SERVERS = [
    {name:'Apache-01',type:'Apache HTTP',host:'APP-SRV-01',version:'2.4.52',req:1240,resp:42,cpu:34,mem:58,status:'running',err:0},
    {name:'Tomcat-01',type:'Apache Tomcat',host:'APP-SRV-01',version:'9.0.65',req:890,resp:78,cpu:45,mem:68,status:'running',err:2},
    {name:'JBoss-01', type:'JBoss EAP',   host:'APP-SRV-02',version:'7.4.0', req:560,resp:95,cpu:52,mem:75,status:'running',err:5},
    {name:'Apache-02',type:'Apache HTTP', host:'APP-SRV-03',version:'2.4.52',req:320,resp:38,cpu:22,mem:41,status:'running',err:0},
    {name:'Tomcat-02',type:'Apache Tomcat',host:'APP-SRV-02',version:'9.0.65',req:0,  resp:0, cpu:0,  mem:0,  status:'stopped',err:0}
];

const DB_SERVERS = [
    {name:'PostgreSQL-01',type:'PostgreSQL',host:'DB-SRV-01',version:'14.2',conn:245,qps:1840,slow:3,rep:99.9,cpu:38,mem:74,status:'running'},
    {name:'MySQL-01',     type:'MySQL',     host:'DB-SRV-02',version:'8.0.28',conn:180,qps:2200,slow:12,rep:99.7,cpu:55,mem:82,status:'running'},
    {name:'PostgreSQL-02',type:'PostgreSQL',host:'DB-SRV-03',version:'14.2',conn:98, qps:450, slow:1, rep:100, cpu:18,mem:44,status:'running'},
    {name:'MySQL-02',     type:'MySQL',     host:'DB-SRV-04',version:'8.0.28',conn:0,  qps:0,   slow:0, rep:0,   cpu:0, mem:0, status:'stopped'}
];

// ── Configuration Management ──────────────────────────────────────
const CONFIG_REPO = [
    {dev:'CORE-RTR-01',  ip:'10.0.0.1',   ver:'v24',  date:'2024-03-20 09:00',size:'48 KB', by:'admin',     changes:3,  status:'current' },
    {dev:'CORE-RTR-02',  ip:'10.0.0.2',   ver:'v18',  date:'2024-03-19 14:30',size:'52 KB', by:'netops',    changes:1,  status:'current' },
    {dev:'EDGE-FW-01',   ip:'192.168.1.1',ver:'v31',  date:'2024-03-20 08:00',size:'124 KB',by:'secops',    changes:7,  status:'changed' },
    {dev:'WAN-RTR-01',   ip:'172.16.0.1', ver:'v12',  date:'2024-03-18 11:00',size:'39 KB', by:'admin',     changes:2,  status:'current' },
    {dev:'DIST-SW-01',   ip:'10.1.0.1',   ver:'v8',   date:'2024-03-15 16:00',size:'28 KB', by:'netops',    changes:0,  status:'current' },
    {dev:'PE-RTR-01',    ip:'172.20.0.1', ver:'v15',  date:'2024-03-17 10:30',size:'61 KB', by:'mpls-ops',  changes:4,  status:'changed' },
    {dev:'IDC-FW-01',    ip:'10.0.1.1',   ver:'v22',  date:'2024-03-20 07:30',size:'98 KB', by:'secops',    changes:9,  status:'changed' },
    {dev:'LB-01',        ip:'10.3.0.1',   ver:'v6',   date:'2024-03-14 09:00',size:'18 KB', by:'admin',     changes:0,  status:'current' }
];

const CONFIG_STATS = [
    {ico:'📦',val:'248',  lbl:'Total Backups',  col:'blue'  },
    {ico:'🔄',val:'18',   lbl:'Changed Today',   col:'orange'},
    {ico:'⚠️',val:'3',    lbl:'Drift Detected',  col:'red'   },
    {ico:'✅',val:'99.2%',lbl:'Backup Success',  col:'green' }
];

// ── Self-CHOP Policies ────────────────────────────────────────────
const CFG_POLICIES = [
    {id:'POL-001',name:'New Device Bootstrap',   devType:'Router',  tmpl:'Cisco-RTR-Base', trigger:'Discovery',  last:'10:42 Today', status:'active'},
    {id:'POL-002',name:'Switch VLAN Provisioning',devType:'Switch', tmpl:'L2-VLAN-Std',    trigger:'LLDP Detect',last:'09:15 Today', status:'active'},
    {id:'POL-003',name:'Firewall Policy Sync',   devType:'Firewall',tmpl:'FW-SecProfile',  trigger:'Diff Detect',last:'08:00 Today', status:'active'},
    {id:'POL-004',name:'WAN QoS Template',       devType:'Router',  tmpl:'QoS-WAN-v2',     trigger:'Manual',     last:'Yesterday',   status:'active'},
    {id:'POL-005',name:'AP Config Rollout',      devType:'AP',      tmpl:'WLAN-Corp-2.4G', trigger:'Provisioning',last:'2d ago',     status:'paused'}
];

const CFG_LOGS = [
    {time:'10:42:11',dev:'ACC-SW-05',policy:'New Device Bootstrap',  changes:'12 commands', result:'Success',  by:'Auto'},
    {time:'10:38:04',dev:'EDGE-FW-01',policy:'Firewall Policy Sync', changes:'7 rules',     result:'Success',  by:'Auto'},
    {time:'09:15:22',dev:'DIST-SW-03',policy:'Switch VLAN Provision',changes:'4 VLANs',     result:'Success',  by:'Auto'},
    {time:'08:00:00',dev:'WAN-RTR-01', policy:'WAN QoS Template',    changes:'8 classes',   result:'Success',  by:'netops'},
    {time:'Yesterday',dev:'PE-RTR-01', policy:'MPLS TE Policy',      changes:'3 tunnels',   result:'Failed',   by:'Auto'}
];

// ── Self-Healing Events ───────────────────────────────────────────
const HEAL_EVENTS = [
    {time:'09:45:00',dev:'WAN-RTR-01',  fault:'BGP session drop',  action:'Restart BGP process',    recovery:'42 sec',  result:'Success'},
    {time:'08:30:00',dev:'APP-SRV-01',  fault:'Tomcat OOM error',  action:'Restart Tomcat service', recovery:'18 sec',  result:'Success'},
    {time:'07:15:00',dev:'DIST-SW-02',  fault:'Port flapping',     action:'Apply port dampening',   recovery:'5 sec',   result:'Success'},
    {time:'Yesterday',dev:'DB-SRV-01',  fault:'MySQL crash',       action:'DB service restart',     recovery:'2m 10s',  result:'Success'},
    {time:'2d ago',  dev:'BRANCH-RTR-01',fault:'OSPF neighbor loss',action:'Reset OSPF adjacency',  recovery:'Failed',  result:'Failed'},
    {time:'2d ago',  dev:'WLAN-CTRL-01',fault:'AP disassociation', action:'Force AP re-association',recovery:'15 sec',  result:'Success'}
];

// ── Self-Optimisation ─────────────────────────────────────────────
const OPT_LOG = [
    {time:'10:00:00',dev:'CORE-RTR-01', param:'OSPF Hello Interval',before:'10s',after:'5s',    impact:'Faster convergence',    status:'applied'},
    {time:'09:30:00',dev:'WAN-RTR-01',  param:'QoS DSCP Marking',   before:'CS0', after:'EF',  impact:'VoIP quality +18%',     status:'applied'},
    {time:'08:45:00',dev:'EDGE-FW-01',  param:'Session Timeout',    before:'3600',after:'1800', impact:'Memory freed 12%',      status:'applied'},
    {time:'Yesterday',dev:'DIST-SW-01', param:'STP Priority',       before:'32768',after:'4096',impact:'Optimal root bridge',   status:'applied'},
    {time:'Yesterday',dev:'APP-SRV-01', param:'JVM Heap Size',      before:'512M', after:'1G',  impact:'GC pause -40%',         status:'applied'},
    {time:'2d ago',  dev:'WAN-RTR-02',  param:'BGP Keepalive',      before:'60s',  after:'30s', impact:'Faster failure detect', status:'pending'}
];

const OPT_SCORES = [
    {label:'Network Convergence',  val:88, color:'#0ea5e9'},
    {label:'Bandwidth Efficiency', val:76, color:'#22c55e'},
    {label:'QoS Effectiveness',    val:92, color:'#a855f7'},
    {label:'Routing Optimization', val:84, color:'#14b8a6'},
    {label:'Security Posture',     val:71, color:'#ef4444'}
];

// ── Self-Protection / Threats ─────────────────────────────────────
const THREATS = [
    {time:'10:15:08',src:'45.33.22.11',  type:'Port Scan',        target:'EDGE-FW-01',   sev:'critical',action:'Blocked at FW',  status:'blocked'},
    {time:'10:08:55',src:'192.168.1.50', type:'Policy Violation', target:'CORE-RTR-01',  sev:'major',   action:'Alert + Log',    status:'logged'},
    {time:'09:55:44',src:'10.2.0.78',    type:'Brute Force SSH',  target:'APP-SRV-01',   sev:'critical',action:'IP Blocked',     status:'blocked'},
    {time:'09:30:11',src:'103.45.67.22', type:'DDoS Flood',       target:'EDGE-FW-01',   sev:'critical',action:'Rate Limited',   status:'mitigated'},
    {time:'09:15:05',src:'10.5.0.88',    type:'Anomalous Traffic',target:'WAN-RTR-01',   sev:'warning', action:'Traffic Sampled',status:'monitoring'},
    {time:'Yesterday',src:'185.220.101.9',type:'CVE Exploit Attempt',target:'APP-SRV-01',sev:'critical',action:'Connection Reset',status:'blocked'},
    {time:'Yesterday',src:'10.1.0.44',   type:'ARP Spoofing',    target:'DIST-SW-01',   sev:'major',   action:'Port Isolated',  status:'blocked'}
];

const THREAT_TYPES = [
    {name:'Port Scan',   pct:32, color:'#ef4444'},
    {name:'Brute Force', pct:22, color:'#f59e0b'},
    {name:'DDoS',        pct:18, color:'#a855f7'},
    {name:'Exploit',     pct:14, color:'#0ea5e9'},
    {name:'Anomaly',     pct:10, color:'#22c55e'},
    {name:'Other',       pct:4,  color:'#64748b'}
];

// ── Cloud Management ──────────────────────────────────────────────
const CLOUD_PLATFORMS = [
    {name:'VMware vCloud',  icon:'🔵',type:'Private Cloud',vms:84, cpu:'62%',mem:'71%',disk:'54%',status:'healthy'},
    {name:'OpenStack',      icon:'🔴',type:'Private Cloud',vms:62, cpu:'55%',mem:'65%',disk:'48%',status:'healthy'},
    {name:'KVM (On-Prem)', icon:'🟢',type:'Hypervisor',   vms:34, cpu:'44%',mem:'58%',disk:'38%',status:'healthy'}
];

const VMS = [
    {name:'WEB-VM-01',   plat:'VMware',   host:'ESX-01',vcpu:4, ram:8,  disk:100,ip:'10.10.1.10',status:'running'},
    {name:'WEB-VM-02',   plat:'VMware',   host:'ESX-01',vcpu:4, ram:8,  disk:100,ip:'10.10.1.11',status:'running'},
    {name:'APP-VM-01',   plat:'VMware',   host:'ESX-02',vcpu:8, ram:16, disk:200,ip:'10.10.1.20',status:'running'},
    {name:'DB-VM-01',    plat:'OpenStack',host:'CMPTE-01',vcpu:8,ram:32,disk:500,ip:'10.10.1.30',status:'running'},
    {name:'MQ-VM-01',    plat:'OpenStack',host:'CMPTE-02',vcpu:2,ram:4, disk:50, ip:'10.10.1.40',status:'running'},
    {name:'CACHE-VM-01', plat:'KVM',      host:'KVM-01',vcpu:4, ram:8,  disk:100,ip:'10.10.1.50',status:'running'},
    {name:'TEST-VM-01',  plat:'VMware',   host:'ESX-03',vcpu:2, ram:4,  disk:50, ip:'10.10.1.60',status:'stopped'},
    {name:'BACKUP-VM-01',plat:'OpenStack',host:'CMPTE-03',vcpu:4,ram:8, disk:2000,ip:'10.10.1.70',status:'running'}
];

const CLOUD_RES = [
    {name:'vCPU Used',  pct:58, color:'#0ea5e9'},
    {name:'RAM Used',   pct:67, color:'#22c55e'},
    {name:'Disk Used',  pct:48, color:'#f59e0b'},
    {name:'Network IO', pct:42, color:'#a855f7'}
];

// ── MPLS ──────────────────────────────────────────────────────────
const MPLS_STATS = [
    {ico:'🔀',val:'4',  lbl:'PE Routers',    col:'blue'  },
    {ico:'🖥️',val:'12', lbl:'CE Routers',    col:'teal'  },
    {ico:'🏗️',val:'6',  lbl:'P Routers',     col:'purple'},
    {ico:'🔗',val:'12', lbl:'L3 VPNs',       col:'green' },
    {ico:'🔗',val:'4',  lbl:'L2 VPNs',       col:'orange'},
    {ico:'📊',val:'98.8%',lbl:'LSP Up Rate', col:'green' }
];

const VPNS = [
    {name:'VPN-CORP-01', type:'L3VPN',prov:'Bharti-Airtel',pe:'PE-RTR-01',ce:'BRANCH-RTR-01',vrf:'CORP_A',bw:'10Mbps', status:'up'},
    {name:'VPN-CORP-02', type:'L3VPN',prov:'BSNL',          pe:'PE-RTR-01',ce:'BRANCH-RTR-02',vrf:'CORP_B',bw:'2Mbps',  status:'up'},
    {name:'VPN-DC-01',   type:'L3VPN',prov:'Tata-Comms',    pe:'PE-RTR-02',ce:'DC-EDGE',       vrf:'DC_VPN', bw:'1Gbps',  status:'up'},
    {name:'VPN-BACKUP',  type:'L2VPN',prov:'Reliance-JIO',  pe:'PE-RTR-02',ce:'BACKUP-RTR',    vrf:'—',      bw:'100Mbps',status:'up'},
    {name:'VPN-BRANCH-3',type:'L3VPN',prov:'Bharti-Airtel', pe:'PE-RTR-01',ce:'BRANCH-RTR-03', vrf:'CORP_C', bw:'5Mbps',  status:'down'}
];

// ── SLA ───────────────────────────────────────────────────────────
const SLA_DATA = [
    {id:'SLA-001',svc:'Internet Uptime',  cust:'HQ',       metric:'Availability',  target:'99.9%', cur:'99.97%',comp:100,  viol:0,  status:'compliant'},
    {id:'SLA-002',svc:'WAN Link',         cust:'Branch-DL',metric:'Availability',  target:'99.5%', cur:'98.8%', comp:98.8, viol:2,  status:'breach'},
    {id:'SLA-003',svc:'VoIP Quality',     cust:'Corp',     metric:'Jitter < 10ms', target:'< 10ms',cur:'8.2ms', comp:96.4, viol:1,  status:'compliant'},
    {id:'SLA-004',svc:'Response Time',    cust:'Web App',  metric:'RTT < 50ms',    target:'< 50ms',cur:'42ms',  comp:94.2, viol:3,  status:'compliant'},
    {id:'SLA-005',svc:'Backup Link',      cust:'Branch-PU',metric:'Availability',  target:'99.0%', cur:'95.2%', comp:95.2, viol:8,  status:'breach'},
    {id:'SLA-006',svc:'DNS Resolution',   cust:'All',      metric:'Uptime',        target:'99.99%',cur:'99.99%',comp:100,  viol:0,  status:'compliant'},
    {id:'SLA-007',svc:'Security Patching',cust:'Corp',     metric:'Patch in 48h',  target:'100%',  cur:'92%',   comp:92,   viol:4,  status:'breach'}
];

const SLA_STATS = [
    {ico:'✅',val:'4',   lbl:'Compliant SLAs', col:'green' },
    {ico:'⚠️',val:'3',   lbl:'SLA Breaches',   col:'red'   },
    {ico:'📊',val:'94.2%',lbl:'Avg Compliance',col:'blue'  },
    {ico:'🔔',val:'18',  lbl:'Violation Alerts',col:'orange'}
];

// ── Security Management ───────────────────────────────────────────
const SEC_USERS = [
    {user:'admin',     role:'Super Admin',    devs:'All',  perms:'R/W/Execute', last:'Just now',  ip:'192.168.1.5',  twofa:true, status:'active'},
    {user:'netops',    role:'Network Ops',    devs:'LAN/WAN',perms:'R/W',      last:'1 hr ago',  ip:'192.168.1.6',  twofa:true, status:'active'},
    {user:'secops',    role:'Security Ops',   devs:'FW/IDS', perms:'R/W',      last:'2 hrs ago', ip:'192.168.1.7',  twofa:true, status:'active'},
    {user:'mpls-ops',  role:'MPLS Engineer',  devs:'MPLS',   perms:'R/W',      last:'3 hrs ago', ip:'192.168.1.8',  twofa:false,status:'active'},
    {user:'auditor',   role:'Auditor',        devs:'All',    perms:'R only',   last:'Yesterday', ip:'10.0.0.50',    twofa:true, status:'active'},
    {user:'cloud-ops', role:'Cloud Engineer', devs:'VMs',    perms:'R/W',      last:'4 hrs ago', ip:'192.168.1.9',  twofa:true, status:'active'},
    {user:'guest01',   role:'Read-Only Guest',devs:'None',   perms:'R only',   last:'3 days ago',ip:'Any',          twofa:false,status:'inactive'}
];

const SEC_AUDIT = [
    {time:'10:42:11',user:'admin',    action:'Configuration Backup',  res:'CORE-RTR-01',  ip:'192.168.1.5',result:'Success'},
    {time:'10:38:04',user:'secops',   action:'Firewall Policy Update', res:'EDGE-FW-01',   ip:'192.168.1.7',result:'Success'},
    {time:'10:15:08',user:'System',   action:'Intrusion Blocked',      res:'EDGE-FW-01',   ip:'45.33.22.11',result:'Blocked'},
    {time:'10:08:55',user:'netops',   action:'Device Reboot',          res:'BRANCH-RTR-01',ip:'192.168.1.6',result:'Failed'},
    {time:'09:55:44',user:'System',   action:'Brute Force Blocked',    res:'APP-SRV-01',   ip:'10.2.0.78',  result:'Blocked'},
    {time:'09:30:11',user:'admin',    action:'User Account Created',   res:'cloud-ops',    ip:'192.168.1.5',result:'Success'},
    {time:'09:15:05',user:'mpls-ops', action:'VPN Configuration',      res:'PE-RTR-01',    ip:'192.168.1.8',result:'Success'},
    {time:'09:00:00',user:'unknown',  action:'Login Failed (3x)',      res:'Admin Panel',  ip:'185.220.5.1',result:'Blocked'}
];

// ── Logs ──────────────────────────────────────────────────────────
const LOG_ENTRIES = [
    {time:'10:42:11',level:'critical',src:'Syslog',    dev:'BRANCH-RTR-01',msg:'%LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to down'},
    {time:'10:41:55',level:'alert',   src:'SNMP Trap', dev:'WAN-RTR-02',   msg:'CPU utilization rising: 88% over threshold 85%'},
    {time:'10:40:22',level:'error',   src:'Syslog',    dev:'APP-SRV-01',   msg:'[Tomcat] java.lang.OutOfMemoryError: Java heap space'},
    {time:'10:38:04',level:'warning', src:'Syslog',    dev:'EDGE-FW-01',   msg:'Firewall session table 78% full. Consider increasing limits'},
    {time:'10:35:18',level:'info',    src:'NetFlow',   dev:'CORE-RTR-01',  msg:'High bandwidth flow detected: 10.10.1.1 → 203.45.67.89 (2.4GB/hr)'},
    {time:'10:30:11',level:'warning', src:'Syslog',    dev:'DB-SRV-01',    msg:'MySQL: Slow query detected (12.4s): SELECT * FROM reports WHERE...'},
    {time:'10:25:44',level:'info',    src:'Windows',   dev:'APP-SRV-01',   msg:'Service "Apache Tomcat 9" started successfully (Event ID 7036)'},
    {time:'10:20:30',level:'critical',src:'SNMP Trap', dev:'IDC-FW-01',    msg:'SNMP Trap: Interface Gi0/2 down – possible link failure'},
    {time:'10:15:08',level:'alert',   src:'Syslog',    dev:'EDGE-FW-01',   msg:'%IPS-4-SIGNATURE: Sig:1000:0:1 Port Scan from 45.33.22.11'},
    {time:'10:10:05',level:'debug',   src:'Application',dev:'APP-SRV-02',  msg:'JBoss EAP: Cache eviction triggered – 1240 objects purged'},
    {time:'10:05:22',level:'info',    src:'Syslog',    dev:'CORE-RTR-01',  msg:'%OSPF-5-ADJCHG: Process 1, Nbr 10.0.0.2 on Gi0/0/0 from FULL to 2WAY'},
    {time:'10:00:00',level:'error',   src:'Windows',   dev:'DB-SRV-01',    msg:'MySQL Error 1040: Too many connections (max_connections=200)'}
];

const LOG_STATS = [
    {ico:'📋',val:'24,891',lbl:'Logs Today',     col:'blue'  },
    {ico:'🔴',val:'12',    lbl:'Critical/Alerts',col:'red'   },
    {ico:'⚠️',val:'48',    lbl:'Errors/Warnings',col:'orange'},
    {ico:'💾',val:'4.2 GB',lbl:'Log Storage',    col:'purple'}
];

// ── Help Desk ─────────────────────────────────────────────────────
const HD_TICKETS = [
    {id:'TKT-001',title:'BRANCH-RTR-01 unreachable',    dev:'BRANCH-RTR-01',cat:'Network',    pri:'critical',assign:'netops',    created:'10:40 Today',sla:'2h',  status:'open'},
    {id:'TKT-002',title:'WAN-RTR-02 high CPU',          dev:'WAN-RTR-02',   cat:'Performance',pri:'high',    assign:'netops',    created:'10:38 Today',sla:'4h',  status:'in progress'},
    {id:'TKT-003',title:'Tomcat OOM – APP-SRV-01',      dev:'APP-SRV-01',   cat:'Application',pri:'high',    assign:'appops',    created:'10:40 Today',sla:'4h',  status:'in progress'},
    {id:'TKT-004',title:'Firewall policy review needed', dev:'EDGE-FW-01',   cat:'Security',   pri:'medium',  assign:'secops',    created:'10:15 Today',sla:'8h',  status:'open'},
    {id:'TKT-005',title:'MySQL slow query issue',        dev:'DB-SRV-01',    cat:'Database',   pri:'medium',  assign:'dba',       created:'09:55 Today',sla:'8h',  status:'in progress'},
    {id:'TKT-006',title:'AP association failure – WLAN', dev:'WLAN-CTRL-01', cat:'WLAN',       pri:'low',     assign:'netops',    created:'09:42 Today',sla:'24h', status:'open'},
    {id:'TKT-007',title:'VPN-BRANCH-3 down',            dev:'PE-RTR-01',    cat:'MPLS/VPN',   pri:'high',    assign:'mpls-ops',  created:'09:30 Today',sla:'4h',  status:'open'},
    {id:'TKT-008',title:'Config backup failed – LB-01', dev:'LB-01',        cat:'Configuration',pri:'low',   assign:'admin',     created:'09:00 Today',sla:'24h', status:'resolved'}
];

const HD_STATS = [
    {ico:'🎫',val:'17',   lbl:'Open Tickets',    col:'orange'},
    {ico:'🔄',val:'5',    lbl:'In Progress',     col:'blue'  },
    {ico:'✅',val:'8',    lbl:'Resolved Today',  col:'green' },
    {ico:'⚡',val:'2.4h', lbl:'Avg Resolution',  col:'purple'}
];

const HD_VOL = [8,12,9,14,11,18,15,10,13,16,12,9,14,11,17,13,8,12,10,15,11,9,13,16,14,10,12,8,11,15];

// ── Reports ───────────────────────────────────────────────────────
const REPORT_LIST = [
    {icon:'📊',title:'Network Availability Report',  desc:'Uptime/downtime statistics for all devices',   fmts:['HTML','CSV','XLS']},
    {icon:'📈',title:'Performance Summary Report',   desc:'CPU, memory, interface utilization trends',    fmts:['HTML','CSV','XLS']},
    {icon:'🌊',title:'Traffic Flow Analysis Report', desc:'Top talkers, protocols, bandwidth trends',     fmts:['HTML','CSV']},
    {icon:'🚨',title:'Fault & Alarm Report',         desc:'All alarms with root cause and resolution',    fmts:['HTML','CSV','XLS']},
    {icon:'⚙️',title:'Configuration Change Report',  desc:'Config changes with before/after diff',        fmts:['HTML','CSV']},
    {icon:'⏱️',title:'SLA Compliance Report',        desc:'SLA metrics, breaches, compliance %',          fmts:['HTML','CSV','XLS']},
    {icon:'🔒',title:'Security Audit Report',        desc:'Security events, user activity, blocked IPs',  fmts:['HTML','CSV','XLS']},
    {icon:'☁️',title:'Cloud Resource Report',        desc:'VM inventory, utilization across platforms',   fmts:['HTML','CSV']},
    {icon:'🔀',title:'MPLS/VPN Status Report',       desc:'VPN status, LSP health, PE/CE inventory',     fmts:['HTML','CSV']},
    {icon:'📝',title:'Log Summary Report',           desc:'Log volume, critical events, anomalies',       fmts:['HTML','CSV','XLS']},
    {icon:'🎫',title:'Help Desk Summary Report',     desc:'Ticket volume, resolution time, open tickets', fmts:['HTML','CSV']},
    {icon:'🖥️',title:'Application Health Report',    desc:'App servers response time, errors, uptime',   fmts:['HTML','CSV']}
];

// ── BW Trend Data ─────────────────────────────────────────────────
const BW_24H   = [1.8,1.6,1.4,1.3,1.2,1.1,1.0,1.2,1.8,2.4,3.1,3.8,4.2,4.0,3.8,3.5,3.2,3.6,4.0,4.2,3.8,3.4,2.9,2.4];
const FAULT_TREND = {
    days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    critical:[3,2,4,1,5,2,3], major:[8,6,9,5,10,4,7], minor:[14,12,16,10,18,8,12]
};
const MONTHLY_SLA = [96.2,94.8,97.1,95.4,98.0,96.8,97.5,95.2,98.4,96.0,97.8,94.2];