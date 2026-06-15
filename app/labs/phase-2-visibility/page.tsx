import Link from "next/link";

const labs = [
  {
    slug: "syslog-pipeline",
    number: "2.1",
    title: "Syslog Forwarding Pipeline",
    description: "Build the log pipeline from OPNsense to Sentinel: configure syslog-ng on OPNsense to forward filterlog events over UDP 514, set up rsyslog on a Linux forwarder VM, deploy Azure Monitor Agent with a Data Collection Rule, and get raw firewall events into the Syslog table.",
    skills: ["syslog-ng configuration", "Data Collection Rules", "Azure Monitor Agent", "Log pipeline debugging", "cloud-init automation"],
    status: "Completed",
    date: "May 2026",
  },
  {
    slug: "sentinel-siem",
    number: "2.2",
    title: "Microsoft Sentinel & KQL Threat Hunting",
    description: "Enable Microsoft Sentinel, install the pfSense Content Hub parser to structure raw filterlog CSV data, run attack simulations, and write KQL queries that parse firewall events into structured threat intelligence. Prove the detection chain works end to end.",
    skills: ["Microsoft Sentinel", "KQL queries", "Attack simulation", "Threat hunting", "Content Hub parsers"],
    status: "Completed",
    date: "Jun 2026",
  },
  {
    slug: "vnet-flow-logs",
    number: "2.3",
    title: "Azure VNet Flow Logs & Traffic Analytics",
    description: "Deploy Azure VNet Flow Logs as the replacement for retired NSG flow logs, configure Traffic Analytics to forward data to the Sentinel workspace, and query NSG-level allow/deny decisions in the AzureNetworkAnalytics_CL table.",
    skills: ["Azure VNet Flow Logs", "Traffic Analytics", "Network Watcher", "Azure NSG visibility", "Terraform + portal hybrid"],
    status: "Completed",
    date: "Jun 2026",
  },
];

const nseMapping = [
  { skill: "SIEM Deployment", detail: "Standing up Microsoft Sentinel on a fresh Log Analytics workspace, connecting data sources, installing content parsers" },
  { skill: "Log Pipeline Engineering", detail: "Designing and debugging a multi-hop syslog pipeline: NVA → syslog-ng → AMA → Sentinel" },
  { skill: "KQL Threat Hunting", detail: "Parsing raw CSV filterlog events into structured fields, writing hunting queries across Syslog and flow log tables" },
  { skill: "Network Traffic Analysis", detail: "Reading VNet flow logs to understand NSG allow/deny patterns and correlate with OPNsense firewall decisions" },
  { skill: "DCR Management", detail: "Configuring Data Collection Rules for syslog facility targeting, and handling Sentinel's automatic DCR modifications" },
];

export default function Phase2Page() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-12" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--text-2)" }}>Home</Link>
          <span>/</span>
          <Link href="/labs" className="hover:underline" style={{ color: "var(--text-2)" }}>Labs</Link>
          <span>/</span>
          <span>Phase 2</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              Phase 02
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#30d15820", color: "#30d158" }}>
              Completed
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>Jun 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            Security Visibility<br />&amp; SIEM.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Build the full-stack visibility layer: a structured syslog pipeline from OPNsense firewall
            events to Microsoft Sentinel, Azure VNet Flow Logs for NSG-level traffic data, and KQL
            queries that turn raw log data into actionable threat intelligence.
          </p>
        </div>

        {/* What this phase proves */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>What This Phase Proves</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-2)" }}>
              A firewall that blocks traffic but doesn't log it is security theatre. This phase builds
              complete visibility into every network decision — from OPNsense block events to NSG
              allow/deny flows — and ingests all of it into a SIEM where it can be queried, correlated,
              and acted on. This is the core of what makes a security operation functional.
            </p>
            <div className="space-y-4">
              {nseMapping.map((m) => (
                <div key={m.skill} className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                  <span className="text-sm font-semibold flex-shrink-0 w-52" style={{ color: "var(--text)" }}>{m.skill}</span>
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>{m.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Phase Architecture</h2>
          <div
            className="rounded-3xl p-8 overflow-x-auto"
            style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)", fontFamily: "var(--font-geist-mono)" }}
          >
            <pre className="text-xs leading-relaxed whitespace-pre" style={{ color: "var(--text-2)" }}>{`
  OPNsense NVA (FreeBSD 14.1)
  filterlog daemon → syslog facility local0
  syslog-ng: filter f_local0 { facility(local0); }
             dest d_logfwd  { udp("10.40.1.5" port(514)); }
       │
       │ UDP 514 (syslog stream)
       ▼
  Log Forwarder VM (Ubuntu 22.04 — 10.40.1.5)
  rsyslog: listen UDP/TCP 514
  Azure Monitor Agent (AMA)
  azureotelcollector: ships syslog → Log Analytics
       │
       │ HTTPS (DCR-targeted stream)
       ▼
  ┌─────────────────────────────────────────────┐
  │  Log Analytics Workspace + Sentinel         │
  │                                             │
  │  Syslog table:                              │
  │    facility_name == "local0"                │
  │    SyslogMessage = raw filterlog CSV        │
  │    pfSense parser → structured fields       │
  │    SrcIP, DstIP, DstPort, Action, Protocol  │
  │                                             │
  │  AzureNetworkAnalytics_CL table:            │
  │    VNet Flow Logs → Traffic Analytics       │
  │    NSG allow/deny decisions                 │
  │    FlowType, PublicIPs, Ports, Direction    │
  └─────────────────────────────────────────────┘

  Two visibility sources, one query surface:
  OPNsense → Syslog (firewall decisions, logged blocks)
  Azure NSG → AzureNetworkAnalytics_CL (all flows)
`}</pre>
          </div>
        </section>

        {/* Labs */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>Labs in This Phase</h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>Three labs that build the full visibility stack.</p>
          <div className="flex flex-col gap-5">
            {labs.map((lab) => (
              <div key={lab.slug} className="rounded-3xl p-8"
                style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
                <div className="flex items-start gap-5 mb-5">
                  <span className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                    style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                    {lab.number}
                  </span>
                  <div className="flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#30d15820", color: "#30d158" }}>
                        {lab.status}
                      </span>
                      <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>{lab.date}</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>{lab.title}</h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-2)" }}>{lab.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {lab.skills.map((s) => (
                        <span key={s} className="text-xs px-2.5 py-0.5 rounded-full"
                          style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <Link href={`/labs/phase-2-visibility/${lab.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium"
                      style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                      Read case study →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nav */}
        <div className="flex items-center justify-between pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/labs/phase-1-perimeter" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← Phase 1: Perimeter Security
          </Link>
          <Link href="/labs/phase-3-detection" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Phase 3: Threat Detection →
          </Link>
        </div>
      </div>
    </div>
  );
}
