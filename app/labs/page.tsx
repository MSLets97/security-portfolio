import Link from "next/link";

const phases = [
  {
    number: "01",
    slug: "phase-1-perimeter",
    title: "Perimeter Security & Network Architecture",
    description: "Deploy OPNsense NVA on Azure, segment the network into four isolated subnets, enforce WAN/LAN firewall rules, and establish zero-trust management access via WireGuard VPN — all provisioned with Terraform.",
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
    slug: "phase-4-hunting",
    title: "Attack Simulation & Threat Hunting",
    description: "Run structured attack scenarios mapped to MITRE ATT&CK, build Sentinel Analytics Rules for automated detection, create custom KQL workbooks, and document every detection chain from first packet to fired alert.",
    nseSkills: ["MITRE ATT&CK framework", "Detection engineering", "Threat hunting", "Sentinel analytics rules"],
    status: "Planned",
    date: "Planned",
    labs: [],
  },
  {
    number: "05",
    slug: "phase-5-vulnmgmt",
    title: "Vulnerability Management",
    description: "Deploy OpenVAS vulnerability scanner against all lab VMs, triage CVEs by severity and exploitability, document remediation steps, and track the complete scan-to-fix lifecycle end to end.",
    nseSkills: ["Vulnerability assessment", "CVE triage", "Risk prioritization", "Remediation tracking"],
    status: "Planned",
    date: "Planned",
    labs: [],
  },
  {
    number: "06",
    slug: "phase-6-identity",
    title: "Identity & Access Control",
    description: "Stand up Active Directory on Windows Server 2025, enforce Group Policy hardening baselines, integrate with Azure Entra ID, and configure MFA and RBAC for privileged access management across the lab.",
    nseSkills: ["Active Directory", "Group Policy hardening", "Entra ID / Azure AD", "Privileged access management"],
    status: "Planned",
    date: "Planned",
    labs: [],
  },
  {
    number: "07",
    slug: "phase-7-ir",
    title: "Incident Response",
    description: "Execute a full IR lifecycle — detect, contain, eradicate, recover — using attacks observed in earlier phases. Write post-incident reports and automate response with Sentinel SOAR Logic Apps playbooks.",
    nseSkills: ["IR methodology (PICERL)", "SOAR automation", "Forensic timeline analysis", "Post-incident reporting"],
    status: "Planned",
    date: "Planned",
    labs: [],
  },
  {
    number: "08",
    slug: "phase-8-compliance",
    title: "Compliance & Hardening",
    description: "Apply CIS Benchmark hardening to Windows Server 2025 and Ubuntu VMs, collect audit evidence, map security controls to NIST CSF, and build Sentinel compliance dashboards for reporting.",
    nseSkills: ["CIS Benchmarks", "NIST CSF mapping", "Security auditing", "Compliance dashboards"],
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
            { label: "Planned", value: "5" },
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
                    {phase.status !== "Planned" ? (
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
      </div>
    </div>
  );
}
