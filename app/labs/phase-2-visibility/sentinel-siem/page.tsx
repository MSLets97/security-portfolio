import Link from "next/link";
import { LabWalkthrough, WalkthroughStep } from "@/components/LabWalkthrough";
import { CodeAndDocs, CodeLink } from "@/components/CodeLinks";

const codeLinks: CodeLink[] = [
  {
    label: "main.tf — resource 9",
    href: "https://github.com/MSLets97/azure-opnsense-nva/blob/main/main.tf#L292-L295",
    description: "The azurerm_sentinel_log_analytics_workspace_onboarding resource. The Content Hub parser, attack simulations, and KQL queries on this page are configured directly in Sentinel, not in Terraform.",
  },
];

const walkthroughSteps: WalkthroughStep[] = [
  {
    title: "Confirm Sentinel is onboarded to the right workspace",
    what: "Verify Microsoft Sentinel is enabled on the same Log Analytics workspace already receiving syslog data from Lab 2.1.",
    how: "Azure Portal → Microsoft Sentinel → confirm the workspace shown matches LAW-LogForwarder (already provisioned by Terraform's azurerm_sentinel_log_analytics_workspace_onboarding resource).",
    why: "Sentinel is a layer on top of Log Analytics, not a separate datastore. Using the same workspace means the syslog data already flowing from Lab 2.1 is immediately queryable — there's no second log-shipping path to build.",
    where: "Azure Portal → Microsoft Sentinel.",
  },
  {
    title: "Install the Content Hub parser for OPNsense logs",
    what: "Install the pfSense/OPNsense Content Hub solution so raw filterlog CSV becomes named, structured fields.",
    how: "Sentinel → Content Hub → search \"pfSense\" → Install.",
    why: "filterlog arrives as one long, unlabelled comma-separated line. Without a parser, every single KQL query would need its own manual split()/extract() logic; the parser does that translation once so later queries can reference fields like Action or SrcIP directly.",
    where: "Microsoft Sentinel → Content Hub.",
  },
  {
    title: "Simulate known attacks from a controlled source",
    what: "Run SSH brute-force and reverse-shell probes from outside the VNet, an RDP scan, and SMB/RDP lateral-movement attempts from the client VM.",
    how: "curl/netcat for the WAN-facing tests from an external host; PowerShell's Test-NetConnection from VM-Client-User1 (via WireGuard) for the LAN lateral-movement tests.",
    why: "A known, controlled-source attack lets you verify the entire detection chain on your own schedule and confirm exactly which log entry it should produce — rather than waiting indefinitely for real attack traffic to validate that the pipeline works at all.",
    where: "External test host (WAN tests) + VM-Client-User1 via WireGuard (LAN tests).",
  },
  {
    title: "Write KQL to parse filterlog into queryable fields",
    what: "Query the Syslog table, split the filterlog CSV into named fields (Action, Protocol, SrcIP, DstIP, DstPort), and filter to Action == \"block\".",
    how: "Sentinel → Logs → KQL editor, using split() and extract() against the raw SyslogMessage column.",
    why: "A raw log line on its own isn't an answer to anything. Turning it into typed, named fields is what makes the data hunt-able — for example, being able to ask \"show me every distinct source IP blocked in the last 24 hours\" as a one-line query instead of manually reading log text.",
    where: "Microsoft Sentinel → Logs.",
  },
  {
    title: "Open the WAN briefly and observe real attack traffic",
    what: "Temporarily widen the Azure NSG to allow all inbound ports for about 30 minutes, then review what OPNsense blocks.",
    how: "Change the NSG rule in the Azure Portal, wait, then immediately query Sentinel for filterlog block events during that window, before reverting the NSG change.",
    why: "Simulated attacks prove the detection pipeline works in principle; real, unsolicited internet scanner traffic (LDAP, Elasticsearch, VNC, Grafana, and Telnet probes all arrived within minutes in this lab) proves what the perimeter is actually defending against in practice, and how immediately scanning begins the moment a port is reachable.",
    where: "Azure Portal NSG rules + Microsoft Sentinel Logs.",
  },
];

const techs = [
  "Microsoft Sentinel", "KQL (Kusto Query Language)", "Azure Log Analytics",
  "pfSense / OPNsense Content Hub Parser", "Zenarmor", "PowerShell", "curl",
];

const attackSimulations = [
  { attack: "SSH Brute Force", tool: "curl / netcat", port: "22 / TCP", result: "Blocked by OPNsense WAN rule, logged in filterlog" },
  { attack: "RDP Scan", tool: "PowerShell Test-NetConnection", port: "3389 / TCP", result: "Blocked by OPNsense WAN rule, logged in filterlog" },
  { attack: "Lateral Movement — SMB", tool: "PowerShell Test-NetConnection", port: "445 / TCP", result: "Blocked by OPNsense LAN rule (client → workload), logged" },
  { attack: "Lateral Movement — RDP", tool: "PowerShell Test-NetConnection", port: "3389 / TCP", result: "Blocked by OPNsense LAN rule (client → workload), logged" },
  { attack: "Reverse Shell Attempt", tool: "curl / netcat", port: "4444 / TCP", result: "Blocked by OPNsense WAN rule, logged" },
];

const realTraffic = [
  { source: "Internet scanners", port: "389 (LDAP)", detail: "Active Directory enumeration probes within minutes of WAN exposure" },
  { source: "Internet scanners", port: "9200 (Elasticsearch)", detail: "Automated database exposure scanning" },
  { source: "Internet scanners", port: "5800 (VNC)", detail: "Remote desktop takeover scanning" },
  { source: "Internet scanners", port: "3000 (Grafana)", detail: "Exposed monitoring panel scanning" },
  { source: "Internet scanners", port: "23 (Telnet)", detail: "Legacy protocol scanning for misconfigured devices" },
];

const outcomes = [
  "Microsoft Sentinel operational on Log Analytics workspace with Syslog table receiving OPNsense events",
  "pfSense Content Hub parser installed — raw filterlog CSV parsed into SrcIP, DstIP, DstPort, Action, Protocol",
  "Five attack simulations visible in Sentinel within minutes of execution: SSH, RDP, SMB, Nmap, reverse shell",
  "Real internet scanner traffic observed after opening NSG — LDAP, Elasticsearch, VNC, Grafana, Telnet probes",
  "KQL queries confirmed: OPNsense blocks all unlisted ports while NSG passes allowed ports for appliance inspection",
  "Two-layer defense model proven: NSG silently drops unknown ports; OPNsense logs and blocks what passes NSG",
];

const kqlExamples = [
  {
    title: "Parse filterlog into structured fields",
    query: `Syslog
| where Facility == "local0"
| where SyslogMessage contains "filterlog"
| extend parsed = split(SyslogMessage, ",")
| extend
    Action   = tostring(parsed[6]),
    Protocol = tostring(parsed[16]),
    SrcIP    = tostring(parsed[18]),
    DstIP    = tostring(parsed[19]),
    DstPort  = tostring(parsed[20])
| where Action == "block"
| project TimeGenerated, SrcIP, DstIP, DstPort, Protocol, Action`,
  },
  {
    title: "Top blocked source IPs in last 24 hours",
    query: `Syslog
| where Facility == "local0" and SyslogMessage contains "block"
| extend SrcIP = extract(@",([0-9.]+),[0-9]+,", 1, SyslogMessage)
| summarize BlockCount = count() by SrcIP
| order by BlockCount desc
| take 20`,
  },
];

const roleSkills = [
  "Microsoft Sentinel deployment and workspace configuration from scratch",
  "Content Hub parser installation for structured log parsing",
  "Attack simulation design: mapping test scenarios to expected SIEM events",
  "KQL query writing for log parsing, field extraction, and threat hunting",
  "Correlating multi-source evidence: OPNsense filterlog + NSG flow data",
  "Understanding real-world internet threat exposure from live scanner data",
];

export default function SentinelSIEMPage() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-12" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--text-2)" }}>Home</Link>
          <span>/</span>
          <Link href="/labs" className="hover:underline" style={{ color: "var(--text-2)" }}>Labs</Link>
          <span>/</span>
          <Link href="/labs/phase-2-visibility" className="hover:underline" style={{ color: "var(--text-2)" }}>Phase 2</Link>
          <span>/</span>
          <span>Sentinel & KQL</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              Lab 2.2
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#30d15820", color: "#30d158" }}>Completed</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>Jun 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            Microsoft Sentinel<br />&amp; KQL Threat Hunting.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Enable Microsoft Sentinel, install the OPNsense log parser, run structured attack
            simulations, and write KQL queries that turn raw filterlog CSV data into structured
            threat events. Then open the WAN to the internet and watch real scanners arrive.
          </p>
        </div>

        {/* Objective */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Objective</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
              <p>
                With the syslog pipeline operational, the next step is making the data usable. OPNsense
                filterlog arrives as raw comma-separated values — not human-readable, not queryable without
                parsing. This lab configures Sentinel, installs the Content Hub parser to structure filterlog
                data, and proves the detection chain through controlled attack simulations.
              </p>
              <p>
                A secondary goal is to observe what real internet attack traffic looks like: open the NSG
                to allow all ports and watch what OPNsense blocks in the first 30 minutes. This is real
                data, not simulated — and it shows exactly what the perimeter is defending against daily.
              </p>
            </div>
          </div>
        </section>

        {/* Full Walkthrough */}
        <LabWalkthrough steps={walkthroughSteps} />

        {/* Technologies */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Technologies Used</h2>
          <div className="flex flex-wrap gap-2">
            {techs.map((t) => (
              <span key={t} className="px-4 py-2 rounded-full text-sm"
                style={{ backgroundColor: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Attack Simulations */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Attack Simulations</h2>
          <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="px-8 py-5 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--text-2)" }}>
                Five attack scenarios simulated from an external attacker perspective and from the client VM for lateral movement.
                Each was confirmed visible in Sentinel within 2 minutes of execution.
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {attackSimulations.map((a) => (
                <div key={a.attack} className="px-8 py-4 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{a.attack}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>{a.tool}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>{a.port}</span>
                  <span className="text-xs" style={{ color: "var(--text-2)" }}>{a.result}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Real Traffic */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>Real Internet Attack Traffic</h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-3)" }}>
            After opening the NSG to all ports for 30 minutes, OPNsense blocked the following real scanner activity — all observed in Sentinel filterlog.
          </p>
          <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {realTraffic.map((t) => (
                <div key={t.port} className="px-8 py-4 flex flex-col sm:flex-row gap-2 sm:gap-6">
                  <span className="text-xs font-mono w-44 flex-shrink-0" style={{ color: "var(--accent)" }}>{t.port}</span>
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>{t.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KQL Examples */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>KQL Queries</h2>
          <div className="flex flex-col gap-5">
            {kqlExamples.map((q) => (
              <div key={q.title} className="rounded-3xl overflow-hidden" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{q.title}</p>
                </div>
                <pre className="px-6 py-5 text-xs leading-relaxed overflow-x-auto" style={{ color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>
                  {q.query}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Results */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Results</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="space-y-4">
              {outcomes.map((o) => (
                <div key={o} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: "#30d15820" }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#30d158" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{o}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role Relevance */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>What This Demonstrates</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-2)" }}>
              SIEM configuration and KQL threat hunting are daily tasks for both Security Analysts and
              Security Engineers. This lab proves the ability to go from raw unstructured log data to
              actionable queries — and to understand what the data actually means in the context of real threats.
            </p>
            <div className="space-y-3">
              {roleSkills.map((s) => (
                <div key={s} className="flex items-start gap-3">
                  <span style={{ color: "var(--accent)" }} className="text-sm flex-shrink-0 mt-0.5">›</span>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Code & Documentation */}
        <CodeAndDocs links={codeLinks} />

        {/* Nav */}
        <div className="flex items-center justify-between pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/labs/phase-2-visibility/syslog-pipeline" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← Lab 2.1: Syslog Pipeline
          </Link>
          <Link href="/labs/phase-2-visibility/vnet-flow-logs" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Lab 2.3: VNet Flow Logs →
          </Link>
        </div>
      </div>
    </div>
  );
}
