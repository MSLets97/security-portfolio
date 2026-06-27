import Link from "next/link";

type Phase = {
  number: string;
  slug: string;
  title: string;
  description: string;
  narrative?: string;
  nseSkills: string[];
  status: string;
  date: string;
  labs: { slug: string; title: string; status: string }[];
  hasPage?: boolean;
};

const phases: Phase[] = [
  {
    number: "01",
    slug: "phase-1-perimeter",
    title: "Perimeter Security & Network Architecture",
    description: "Deploy OPNsense NVA on Azure, segment the network into four isolated subnets, enforce WAN/LAN firewall rules, and establish zero-trust management access via WireGuard VPN — all provisioned with Terraform.",
    narrative: "Needed a production-grade perimeter firewall on Azure without using Azure Firewall's $1,000/month cost. Deployed OPNsense as a dual-homed NVA with full hub-and-spoke IaC in Terraform, including WireGuard for zero-trust management access. Result: fully functional four-subnet segmented architecture with stateful inspection and VPN for under $20/month.",
    nseSkills: ["Perimeter firewall management", "Network segmentation", "Infrastructure as Code", "Zero-trust access model"],
    status: "Completed",
    date: "May – Jun 2026",
    labs: [
      { slug: "opnsense-nva", title: "OPNsense NVA Deployment", status: "Completed" },
      { slug: "network-segmentation", title: "Network Segmentation & East-West Controls", status: "Completed" },
    ],
  },
  {
    number: "02",
    slug: "phase-2-visibility",
    title: "Security Visibility & SIEM",
    description: "Build a full-stack log pipeline from OPNsense filterlog to Microsoft Sentinel, deploy Azure VNet Flow Logs for NSG-level traffic visibility, and write KQL queries that parse raw firewall events into actionable threat data.",
    narrative: "Raw firewall logs sitting on a VM are useless for security investigation — they need to reach a SIEM. Built a syslog-ng to Azure Monitor Agent pipeline that forwards OPNsense filterlog to Microsoft Sentinel, then wrote KQL parsers to extract structured fields from raw CSV-formatted packet logs. Result: queryable, structured firewall telemetry available in Sentinel for threat hunting.",
    nseSkills: ["SIEM deployment", "Log pipeline engineering", "KQL threat hunting", "Network traffic analysis"],
    status: "Completed",
    date: "Jun 2026",
    labs: [
      { slug: "syslog-pipeline", title: "Syslog Forwarding Pipeline", status: "Completed" },
      { slug: "sentinel-siem", title: "Microsoft Sentinel & KQL Threat Hunting", status: "Completed" },
      { slug: "vnet-flow-logs", title: "Azure VNet Flow Logs & Traffic Analytics", status: "Completed" },
    ],
  },
  {
    number: "03",
    slug: "phase-3-detection",
    title: "Threat Detection & IDS/IPS",
    description: "Extend OPNsense with Zenarmor next-gen firewall plugin for DNS-layer domain blocking and Suricata in active IPS mode with Emerging Threats rule sets and custom intrusion detection signatures.",
    narrative: "A firewall only inspects ports and IPs — it cannot see inside packets for attack signatures. Enabled Suricata on OPNsense in active IPS mode with Emerging Threats Open rules, configured remote syslog forwarding via the local5 facility, and troubleshot a multi-stage pipeline issue where the wrong syslog facility was blocking delivery to Sentinel. Result: real blacklisted IPs (SSH brute force, RDP scanning) being detected and logged with full EVE JSON telemetry.",
    nseSkills: ["IDS/IPS configuration", "Signature management", "Threat intelligence feeds", "Alert tuning"],
    status: "In Progress",
    date: "In Progress",
    labs: [
      { slug: "zenarmor", title: "Zenarmor Next-Gen Firewall Plugin", status: "Completed" },
      { slug: "suricata-ids", title: "Suricata IDS/IPS & Custom Signatures", status: "In Progress" },
    ],
  },
  {
    number: "04",
    slug: "phase-4-hybrid",
    title: "Hybrid Architecture — On-Premises Lab",
    description: "Mirror the Azure lab on Windows 11 Pro Hyper-V using open-source tooling — OPNsense, Suricata, and Wazuh as a second SIEM — to compare cloud vs on-prem security stacks and eventually correlate both into one Sentinel pane.",
    nseSkills: ["Hyper-V", "Wazuh SIEM/XDR", "Kali Linux", "Hybrid architecture"],
    status: "Planned",
    date: "Planned",
    labs: [],
    hasPage: true,
  },
  {
    number: "05",
    slug: "phase-5-dmz",
    title: "DMZ & Honeypot",
    description: "Deploy a DMZ subnet with intentionally vulnerable web apps (DVWA, WebGoat) exposed to the internet — observe and document real attacker behavior, attack chains, and TTPs.",
    nseSkills: ["DMZ", "DVWA", "WebGoat", "WAF", "Honeypot"],
    status: "Planned",
    date: "Planned",
    labs: [],
  },
  {
    number: "06",
    slug: "phase-6-hunting",
    title: "Attack Simulation & Threat Hunting",
    description: "Use Kali Linux and Metasploit to simulate full attack chains against the lab, then hunt for the indicators in Sentinel using KQL — mapped to MITRE ATT&CK.",
    nseSkills: ["Kali Linux", "Metasploit", "MITRE ATT&CK", "KQL", "Threat Hunting"],
    status: "Planned",
    date: "Planned",
    labs: [],
  },
  {
    number: "07",
    slug: "phase-7-ir",
    title: "Incident Response Automation",
    description: "Build Sentinel playbooks and Logic Apps that automatically respond to high-confidence alerts — isolate VMs, block IPs, send notifications — reducing MTTD and MTTR.",
    nseSkills: ["Logic Apps", "Playbooks", "SOAR", "Automation", "Sentinel"],
    status: "Planned",
    date: "Planned",
    labs: [],
  },
  {
    number: "08",
    slug: "phase-8-vulnmgmt",
    title: "Vulnerability Management",
    description: "Deploy OpenVAS or Tenable for continuous vulnerability scanning, track CVEs across lab VMs, and document remediation workflows.",
    nseSkills: ["OpenVAS", "CVE", "Vulnerability Scanning", "Remediation"],
    status: "Planned",
    date: "Planned",
    labs: [],
  },
  {
    number: "09",
    slug: "phase-9-identity",
    title: "Identity & Zero Trust",
    description: "Deploy Microsoft Entra ID with Conditional Access, MFA, and Privileged Identity Management — integrate with the lab environment for identity-based threat detection.",
    nseSkills: ["Entra ID", "MFA", "Conditional Access", "Zero Trust", "PIM"],
    status: "Planned",
    date: "Planned",
    labs: [],
  },
  {
    number: "10",
    slug: "phase-10-compliance",
    title: "Compliance & Hardening",
    description: "Apply CIS Benchmarks to all lab VMs, document compliance gaps, and map controls to NIST CSF and ISO 27001.",
    nseSkills: ["CIS Benchmarks", "NIST CSF", "ISO 27001", "Hardening", "GRC"],
    status: "Planned",
    date: "Planned",
    labs: [],
  },
];

const statusStyle = (status: string) => {
  if (status === "Completed")  return { bg: "#30d15820", color: "#30d158" };
  if (status === "In Progress") return { bg: "#2997ff20", color: "#2997ff" };
  return { bg: "var(--bg-alt)", color: "var(--text-3)" };
};

export default function LabsPage() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
            Portfolio
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6" style={{ color: "var(--text)" }}>
            Security Lab Portfolio.
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-2)" }}>
            One persistent Azure lab environment, built in phases. Each phase adds a new security
            capability layer — from perimeter defence to compliance — and is fully documented as a
            real engineering case study.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-6 mb-20 mt-10">
          {[
            { label: "Phases Complete", value: "2" },
            { label: "Labs Complete", value: "5" },
            { label: "In Progress", value: "1" },
            { label: "Planned", value: "7" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Phases */}
        <div className="flex flex-col gap-6">
          {phases.map((phase) => {
            const s = statusStyle(phase.status);
            return (
              <div
                key={phase.slug}
                className="rounded-3xl p-8 md:p-10"
                style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Phase number */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-mono font-bold flex-shrink-0"
                    style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}
                  >
                    {phase.number}
                  </div>

                  <div className="flex-1">
                    {/* Status + date */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.color }}>
                        {phase.status}
                      </span>
                      <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>{phase.date}</span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3" style={{ color: "var(--text)" }}>
                      {phase.title}
                    </h2>
                    <p className="text-sm leading-relaxed mb-6 max-w-2xl" style={{ color: "var(--text-2)" }}>
                      {phase.description}
                    </p>

                    {/* Problem narrative */}
                    {phase.narrative && (
                      <div
                        className="rounded-xl px-4 py-3 mb-6 max-w-2xl"
                        style={{ backgroundColor: "var(--bg-alt)", borderLeft: "3px solid var(--accent)" }}
                      >
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{phase.narrative}</p>
                      </div>
                    )}

                    {/* NSE Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {phase.nseSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-3 py-1 rounded-full"
                          style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Labs within phase */}
                    {phase.labs.length > 0 && (
                      <div className="space-y-2 mb-6">
                        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-3)" }}>
                          Labs in this phase
                        </p>
                        {phase.labs.map((lab) => {
                          const ls = statusStyle(lab.status);
                          return (
                            <div key={lab.slug} className="flex items-center gap-3">
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: ls.bg, color: ls.color }}>
                                {lab.status}
                              </span>
                              {lab.status === "Completed" ? (
                                <Link
                                  href={`/labs/${phase.slug}/${lab.slug}`}
                                  className="text-sm font-medium transition-colors hover:underline"
                                  style={{ color: "var(--accent)" }}
                                >
                                  {lab.title} →
                                </Link>
                              ) : (
                                <span className="text-sm" style={{ color: "var(--text-2)" }}>{lab.title}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Phase link */}
                    {phase.status !== "Planned" || phase.hasPage ? (
                      <Link
                        href={`/labs/${phase.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                      >
                        View phase overview →
                      </Link>
                    ) : (
                      <span className="text-sm" style={{ color: "var(--text-3)" }}>Coming soon</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Beyond the roadmap */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-3)" }}>
              Beyond The Roadmap
            </p>
            <p className="text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-2)" }}>
              One more idea under consideration, beyond the ten phases above. Not built yet —
              listed here for transparency, not as completed work.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl p-8 md:p-10" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#30d15820", color: "#30d158" }}>
                Live
              </span>
              <h3 className="text-lg font-bold tracking-tight mt-4 mb-3" style={{ color: "var(--text)" }}>
                Code Vault Reference Page
              </h3>
              <p className="text-sm leading-relaxed max-w-2xl mb-5" style={{ color: "var(--text-2)" }}>
                A browsable page collecting the real KQL queries, the custom Suricata signature, and the
                Terraform UDR actually used across completed labs, in one place, so a reviewer doesn&apos;t
                have to dig through each case study to see the code. Shows only snippets that already
                exist in a published case study — nothing fabricated for the vault itself.
              </p>
              <Link
                href="/code-vault"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                View Code Vault →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
