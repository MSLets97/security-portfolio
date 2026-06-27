import Link from "next/link";
import { BuildSequence, BuildStep } from "@/components/BuildSequence";

const buildSequence: BuildStep[] = [
  {
    title: "Enable Hyper-V on Windows 11 Pro",
    what: "Activate the built-in Windows hypervisor via Windows Features.",
    why: "Enterprise-grade type-1 hypervisor, native to Windows Pro, zero cost.",
    tools: "Windows 11 Pro · Hyper-V Manager",
  },
  {
    title: "Create Internal Virtual Switch in Hyper-V",
    what: "Build an isolated internal network for lab VMs to communicate.",
    why: "Simulates a real LAN segment without exposing traffic to the host network.",
    tools: "Hyper-V Virtual Switch Manager",
  },
  {
    title: "Deploy OPNsense VM in Hyper-V",
    what: "Install OPNsense as the perimeter firewall with two virtual NICs.",
    why: "Mirror the Azure lab firewall — same tool, different environment, compare behavior.",
    tools: "OPNsense 26.x · Hyper-V · FreeBSD",
  },
  {
    title: "Enable Suricata IDS/IPS on OPNsense (on-prem)",
    what: "Configure Suricata with ET Open rules, same as the Azure deployment.",
    why: "Compare detection behavior between the cloud NVA and the on-prem hypervisor.",
    tools: "Suricata 8.x · ET Open rules",
  },
  {
    title: "Deploy Ubuntu Server — Apache + MySQL",
    what: "Ubuntu VM running Apache2 web server and MySQL database server.",
    why: "Realistic victim targets — web apps and databases are primary attack surfaces.",
    tools: "Ubuntu Server 24.04 · Apache2 · MySQL · PHP",
  },
  {
    title: "Deploy Windows Server VM with IIS",
    what: "Windows Server 2022 VM running Internet Information Services.",
    why: "Adds Windows attack surface — IIS misconfigs, Windows auth attacks, NTLM.",
    tools: "Windows Server 2022 · IIS · .NET",
  },
  {
    title: "Deploy Wazuh SIEM/XDR",
    what: "Wazuh server collecting and correlating logs from all on-prem VMs.",
    why: "Open-source SIEM widely used in MSSPs and SMBs — compare to Sentinel.",
    tools: "Wazuh 4.x · Ubuntu Server · OpenSearch",
  },
  {
    title: "Deploy Kali Linux Attack Platform",
    what: "Kali Linux VM to launch controlled attacks against on-prem targets.",
    why: "The only way to validate defenses is to test them with real attack tools.",
    tools: "Kali Linux · Metasploit · Nmap · Burp Suite · Hydra · SQLmap",
  },
  {
    title: "Launch Attacks and Observe in Wazuh",
    what: "Simulate SQLi, brute force, port scanning, and XSS from Kali against the targets.",
    why: "Generate real alerts, tune Suricata rules, document attacker behavior.",
    expected: "Suricata fires on scans, Wazuh detects brute force, Apache logs capture SQLi.",
  },
  {
    title: "Forward On-Prem Logs to Microsoft Sentinel",
    what: "Configure Wazuh syslog forwarding to the Azure log forwarder.",
    why: "Single pane of glass — correlate cloud and on-prem attacks in one SIEM. This completes the full hybrid architecture.",
  },
];

const comparison = [
  { feature: "Cost", sentinel: "Pay-per-GB (enterprise)", wazuh: "Free / Open Source" },
  { feature: "Deployment", sentinel: "Cloud-native (Azure)", wazuh: "Self-hosted" },
  { feature: "Query Language", sentinel: "KQL (Kusto)", wazuh: "Lucene / SQL" },
  { feature: "Best For", sentinel: "Enterprise, MSSP", wazuh: "SMB, homelab" },
  { feature: "XDR Capability", sentinel: "Via Defender suite", wazuh: "Built-in agent" },
  { feature: "Threat Intel", sentinel: "Microsoft TI (built-in)", wazuh: "Community feeds" },
  { feature: "My Experience", sentinel: "Active (current lab)", wazuh: "In progress" },
];

const tags = [
  "Hyper-V", "OPNsense", "Suricata", "Wazuh", "Kali Linux", "Apache",
  "MySQL", "IIS", "Windows Server", "Ubuntu Server", "Hybrid Architecture",
];

function PanelBox({ title, color }: { title: string; color: string }) {
  return (
    <div
      className="rounded-xl px-4 py-3 text-center text-xs font-medium"
      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}55`, color }}
    >
      {title}
    </div>
  );
}

function DownArrow({ color }: { color: string }) {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" className="mx-auto">
      <line x1="7" y1="0" x2="7" y2="12" stroke={color} strokeWidth="1.5" />
      <path d="M2 9 L7 15 L12 9" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Phase4HybridPage() {
  const blue = "#2997ff";
  const green = "#30d158";

  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-12" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--text-2)" }}>Home</Link>
          <span>/</span>
          <Link href="/labs" className="hover:underline" style={{ color: "var(--text-2)" }}>Labs</Link>
          <span>/</span>
          <span>Phase 4</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              Phase 04
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)" }}>
              Planned
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            Hybrid Architecture —<br />On-Premises Lab.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Most enterprise environments are hybrid — not purely cloud. This phase adds a full
            on-premises security lab running on Windows 11 Pro Hyper-V, mirroring the Azure lab
            architecture but using open-source tools available to any organization without a cloud
            budget.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Overview</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
              The on-prem lab introduces Wazuh as a second SIEM alongside Microsoft Sentinel, enabling
              direct comparison of open-source vs enterprise SIEM capabilities — and eventually,
              cross-environment threat correlation from a single Sentinel pane.
            </p>
          </div>
        </section>

        {/* Architecture */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Architecture</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              {/* Azure panel */}
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-center" style={{ color: blue }}>
                  Azure Cloud Lab (Active)
                </p>
                <div className="flex flex-col gap-2">
                  <PanelBox title="Internet" color={blue} />
                  <DownArrow color={blue} />
                  <PanelBox title="OPNsense NVA (Firewall + Suricata IPS)" color={blue} />
                  <DownArrow color={blue} />
                  <PanelBox title="4 VMs (WAN / MGMT / Workload / Client)" color={blue} />
                  <DownArrow color={blue} />
                  <PanelBox title="Log Forwarder (AMA + syslog)" color={blue} />
                  <DownArrow color={blue} />
                  <PanelBox title="Microsoft Sentinel" color={blue} />
                </div>
              </div>

              {/* Bridge */}
              <div className="flex flex-col items-center gap-3 py-6 md:py-0">
                <svg width="18" height="48" viewBox="0 0 18 48" className="hidden md:block">
                  <line x1="9" y1="2" x2="9" y2="46" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="3 4" />
                  <path d="M4 8 L9 2 L14 8" stroke="var(--text-3)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 40 L9 46 L14 40" stroke="var(--text-3)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-xs text-center font-medium max-w-[7rem]" style={{ color: "var(--text-3)" }}>
                  Log correlation
                </p>
              </div>

              {/* On-prem panel */}
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-center" style={{ color: green }}>
                  On-Premises Hyper-V Lab (Planned)
                </p>
                <div className="flex flex-col gap-2">
                  <PanelBox title="Kali Linux (Attacker)" color={green} />
                  <DownArrow color={green} />
                  <PanelBox title="OPNsense VM (Firewall + Suricata)" color={green} />
                  <DownArrow color={green} />
                  <PanelBox title="Apache + MySQL + IIS (Windows Server)" color={green} />
                  <DownArrow color={green} />
                  <PanelBox title="Wazuh SIEM/XDR" color={green} />
                </div>
              </div>
            </div>
            <p className="text-xs text-center mt-8 pt-6" style={{ color: "var(--text-3)", borderTop: "1px solid var(--border)" }}>
              Hybrid Architecture — same skills, different environment.
            </p>
          </div>
        </section>

        {/* Build Sequence */}
        <BuildSequence steps={buildSequence} defaultStatus="Planned" />

        {/* Comparison table */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Sentinel vs. Wazuh</h2>
          <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="grid grid-cols-3 px-6 py-3" style={{ backgroundColor: "var(--bg-alt)" }}>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-3)" }}>Feature</p>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: blue }}>Microsoft Sentinel</p>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: green }}>Wazuh</p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {comparison.map((row) => (
                <div key={row.feature} className="grid grid-cols-3 px-6 py-4 gap-2">
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{row.feature}</p>
                  <p className="text-sm" style={{ color: "var(--text-2)" }}>{row.sentinel}</p>
                  <p className="text-sm" style={{ color: "var(--text-2)" }}>{row.wazuh}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hiring callout */}
        <section className="mb-20">
          <div
            className="rounded-3xl p-8"
            style={{ backgroundColor: "var(--bg-alt)", borderLeft: "4px solid var(--accent)" }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
              Enterprise security teams run hybrid environments — not pure cloud. Being able to deploy,
              configure, and compare security tooling across both Azure and on-premises environments
              demonstrates the engineering depth that mid-level and senior Network Security Engineer
              roles require.
            </p>
          </div>
        </section>

        {/* Tools */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Tools</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="px-4 py-2 rounded-full text-sm"
                style={{ backgroundColor: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Nav */}
        <div className="flex items-center justify-between pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/labs/phase-3-detection" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← Phase 3: Threat Detection
          </Link>
          <Link href="/labs" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            All phases →
          </Link>
        </div>
      </div>
    </div>
  );
}
