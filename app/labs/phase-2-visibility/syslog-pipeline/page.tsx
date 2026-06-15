import Link from "next/link";

const techs = [
  "syslog-ng", "rsyslog", "Azure Monitor Agent (AMA)", "Data Collection Rules (DCR)",
  "Ubuntu 22.04 LTS", "cloud-init", "Terraform (azurerm ~3.0)", "OPNsense (FreeBSD 14.1)",
];

const challenges = [
  {
    number: "01",
    title: "syslog-ng Facility Mismatch — Zero Logs Flowing",
    problem: "syslog-ng destination showed written;0 even after confirming network connectivity. Manual logger tests worked; real firewall block events did not appear in Sentinel.",
    rootCause: "OPNsense's filterlog daemon uses syslog facility local0. The syslog-ng destination filter was configured for facility(local4). Every real firewall event was silently discarded before reaching the log forwarder.",
    fix: "Updated the syslog-ng destination config from facility(local4) to facility(local0) via the OPNsense GUI. Updated the Terraform DCR facility_names to [\"local0\"]. Confirmed with syslog-ng-ctl stats — written count went from 0 to non-zero immediately.",
    lesson: "written;0 with a non-zero s_all processed count is the definitive syslog-ng signal that a filter is rejecting messages, not the network. Always verify with syslog-ng-ctl stats before assuming a connectivity problem.",
  },
  {
    number: "02",
    title: "AMA Running but Syslog Not Reaching Sentinel",
    problem: "Azure Monitor Agent showed Heartbeat in Sentinel but the Syslog table was completely empty. The agent appeared healthy from every monitoring angle.",
    rootCause: "AMA uses an internal service called azureotelcollector to ship syslog data to Log Analytics. This service was installed but never started or enabled — after every VM restart it was inactive (dead), silently dropping all syslog data while AMA heartbeat continued normally.",
    fix: "Ran sudo systemctl start azureotelcollector to confirm it was the missing component. Added systemctl enable azureotelcollector to the VM cloud-init in Terraform to make it permanent across reboots.",
    lesson: "AMA Heartbeat only proves the agent binary is running. It says nothing about the syslog pipeline. Always verify azureotelcollector is active and enabled separately with systemctl status azureotelcollector.",
  },
  {
    number: "03",
    title: "Terraform DCR Deletion Blocked by Sentinel Auto-Association",
    problem: "terraform apply failed with ExistingAssociationsPreventDelete when modifying the Data Collection Rule. The error blocked every subsequent apply — the pipeline was stuck.",
    rootCause: "When Microsoft Sentinel is enabled on a workspace, it automatically creates a DCR association on every VM in the resource group, including OPNsense. Terraform could not delete or modify the DCR while this Sentinel-managed association existed.",
    fix: "Navigated to Azure Portal → Monitor → Data Collection Rules → DCR-Syslog → Resources, removed the Sentinel-created association on vm-opnsense manually. Re-ran terraform apply successfully.",
    lesson: "Sentinel auto-creates DCR associations that Terraform does not manage and cannot see. When you see ExistingAssociationsPreventDelete, always check Data Collection Rules → Resources in the portal for Sentinel-created associations before re-running apply.",
  },
  {
    number: "04",
    title: "Sentinel Auto-Modifies DCR — Terraform Wants to Destroy It",
    problem: "After Sentinel was enabled, terraform plan showed the Data Collection Rule would be destroyed and recreated on every subsequent apply. The syslog pipeline would be broken on every infrastructure change.",
    rootCause: "Microsoft Sentinel automatically modifies DCRs after creation — adding kind=\"Linux\" and extra syslog facilities (local1–local7) as part of workspace onboarding. Terraform detected this as configuration drift and planned a destroy/recreate cycle.",
    fix: "Added lifecycle { ignore_changes = all } to the azurerm_monitor_data_collection_rule resource. Terraform now ignores all post-creation drift on the DCR without destroying it. The pipeline remains stable across all subsequent applies.",
    lesson: "Sentinel modifies DCRs after creation as part of its workspace onboarding process. Always add lifecycle { ignore_changes = all } to DCR resources when Sentinel is enabled — otherwise every apply will try to replace the pipeline.",
  },
];

const outcomes = [
  "End-to-end pipeline operational: OPNsense filterlog blocks arrive in Sentinel Syslog table within 2 minutes",
  "syslog-ng on OPNsense correctly filtering on facility local0 and forwarding to log forwarder on UDP 514",
  "rsyslog on Ubuntu log forwarder receiving and writing OPNsense events to local syslog",
  "Azure Monitor Agent and azureotelcollector both active and enabled via cloud-init — survives VM restarts",
  "Data Collection Rule targeting facility local0 — only OPNsense events collected, not system noise",
  "pfSense Content Hub parser installed in Sentinel — raw filterlog CSV structured into queryable fields",
  "Terraform manages all pipeline infrastructure except DCR associations (lifecycle ignore_changes = all)",
];

const roleSkills = [
  "Multi-hop syslog pipeline design: NVA → syslog-ng → UDP → forwarder → AMA → SIEM",
  "Syslog facility and severity targeting: routing specific log streams to specific destinations",
  "Azure Monitor Agent deployment and troubleshooting at the service level (not just agent level)",
  "Data Collection Rule configuration: facility targeting, association management, lifecycle handling",
  "Diagnosing silent log drops: syslog-ng-ctl stats, systemctl status, Sentinel heartbeat vs data gaps",
  "cloud-init automation for persistent log pipeline configuration across VM reboots",
];

export default function SyslogPipelinePage() {
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
          <span>Syslog Pipeline</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              Lab 2.1
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#30d15820", color: "#30d158" }}>Completed</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>May 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            Syslog Forwarding<br />Pipeline.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Build the log transport layer from scratch: configure syslog-ng on OPNsense to ship
            firewall events over UDP 514, receive them on a dedicated Ubuntu log forwarder, and
            deliver them to Microsoft Sentinel via Azure Monitor Agent — fully automated with cloud-init.
          </p>
        </div>

        {/* Objective */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Objective</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
              <p>
                OPNsense generates a structured log stream called filterlog — one line per firewall
                decision (block or pass), containing source IP, destination IP, port, protocol, and
                rule action. This lab connects that stream to Microsoft Sentinel so every firewall
                decision becomes a queryable security event.
              </p>
              <p>
                The pipeline must survive VM reboots, Terraform applies, and Sentinel's automatic
                workspace configuration changes without breaking. Four engineering problems had to be
                solved before the first event reached the Syslog table.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Architecture</h2>
          <div
            className="rounded-3xl p-8 overflow-x-auto"
            style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)", fontFamily: "var(--font-geist-mono)" }}
          >
            <pre className="text-xs leading-relaxed whitespace-pre" style={{ color: "var(--text-2)" }}>{`
  OPNsense NVA (10.40.1.4)
  ┌────────────────────────────────────────┐
  │  filterlog → local0 syslog facility    │
  │  syslog-ng process:                    │
  │    source  s_opnsense { internal(); }  │
  │    filter  f_local0   { facility(local0); }
  │    dest    d_logfwd   { udp("10.40.1.5" port(514)); }
  └──────────────┬─────────────────────────┘
                 │ UDP 514
                 ▼
  Log Forwarder VM (Ubuntu 22.04 — 10.40.1.5)
  ┌────────────────────────────────────────┐
  │  rsyslog: $ModLoad imudp               │
  │           $UDPServerRun 514            │
  │  Azure Monitor Agent (AMA)             │
  │    reads /var/log/syslog               │
  │  azureotelcollector (enabled via init) │
  │    ships to Log Analytics → HTTPS      │
  └──────────────┬─────────────────────────┘
                 │ HTTPS + DCR
                 ▼
  Log Analytics Workspace
  ┌────────────────────────────────────────┐
  │  DCR-Syslog:                           │
  │    facility_names: ["local0"]          │
  │    lifecycle { ignore_changes = all }  │
  │  Syslog table:                         │
  │    Computer, Facility, SyslogMessage   │
  │    TimeGenerated, HostIP               │
  └────────────────────────────────────────┘
`}</pre>
          </div>
        </section>

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

        {/* Challenges */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>Challenges & Solutions</h2>
          <p className="text-sm mb-10" style={{ color: "var(--text-3)" }}>Four real engineering problems that had to be solved before the first log event reached Sentinel.</p>
          <div className="flex flex-col gap-5">
            {challenges.map((c) => (
              <div key={c.number} className="rounded-3xl p-8"
                style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
                <div className="flex items-start gap-5 mb-6">
                  <span className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                    style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                    {c.number}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight pt-1.5" style={{ color: "var(--text)" }}>{c.title}</h3>
                </div>
                <div className="space-y-5 ml-15">
                  {[{ label: "Problem", text: c.problem }, { label: "Root Cause", text: c.rootCause }, { label: "Fix", text: c.fix }].map((row) => (
                    <div key={row.label}>
                      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-3)" }}>{row.label}</p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{row.text}</p>
                    </div>
                  ))}
                  <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: "var(--bg-alt)", borderLeft: "3px solid var(--accent)" }}>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "var(--accent)" }}>Key Learning</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{c.lesson}</p>
                  </div>
                </div>
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
              Getting log data from a network appliance into a SIEM is a foundational NSE and security
              analyst task. This lab goes beyond "install the agent" — it involves understanding the
              full chain, debugging each hop, and making the pipeline durable.
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

        {/* Nav */}
        <div className="flex items-center justify-between pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/labs/phase-2-visibility" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← Phase 2 overview
          </Link>
          <Link href="/labs/phase-2-visibility/sentinel-siem" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Lab 2.2: Sentinel & KQL →
          </Link>
        </div>
      </div>
    </div>
  );
}
