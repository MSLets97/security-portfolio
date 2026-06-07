import Link from "next/link";

const labs = [
  {
    slug: "azure-nva-siem",
    number: "01",
    title: "Azure NVA + Microsoft Sentinel Pipeline",
    description: "Deployed OPNsense as a Network Virtual Appliance in a hub-and-spoke Azure topology, built a full syslog forwarding pipeline with Azure Monitor Agent, and ingested firewall block events into Microsoft Sentinel — all provisioned with Terraform.",
    tags: ["Azure", "OPNsense", "Sentinel", "Terraform", "WireGuard", "syslog-ng", "AMA", "KQL"],
    status: "Completed",
    date: "Jun 2026",
    highlights: [
      "Hub-and-spoke VNet with OPNsense NVA",
      "WireGuard VPN — no WAN SSH exposure",
      "syslog-ng → AMA → Sentinel pipeline",
      "KQL queries parsing filterlog events",
    ],
  },
  {
    slug: "suricata-ids",
    number: "02",
    title: "Suricata IDS/IPS with Custom Signatures",
    description: "Extend the existing Azure lab with Suricata running in active IPS prevention mode on OPNsense, Emerging Threats rule sets, and custom Snort/Suricata signatures to detect and drop Nmap SYN reconnaissance in real time.",
    tags: ["Suricata", "IDS/IPS", "OPNsense", "Snort Rules", "Emerging Threats", "Sentinel"],
    status: "In Progress",
    date: "Coming Soon",
    highlights: [
      "Suricata in active IPS prevention mode",
      "Emerging Threats (ET) Open rule sets",
      "Custom Nmap SYN detection signatures",
      "IDS alerts streamed to Sentinel",
    ],
  },
  {
    slug: "azure-soc",
    number: "03",
    title: "Full Azure SOC Environment",
    description: "Complete Security Operations Centre on Azure with automated incident response, Sentinel analytics rules mapped to MITRE ATT&CK, SOAR playbooks using Logic Apps, and threat intelligence integration.",
    tags: ["Sentinel", "SOAR", "Logic Apps", "Analytics Rules", "MITRE ATT&CK", "Threat Intel"],
    status: "Planned",
    date: "Planned",
    highlights: [
      "Sentinel analytics rules (MITRE ATT&CK)",
      "SOAR automation via Logic Apps",
      "Threat intelligence integration",
      "Automated incident response playbooks",
    ],
  },
];

export default function LabsPage() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
            Portfolio
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6" style={{ color: "var(--text)" }}>
            Security Labs.
          </h1>
          <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "var(--text-2)" }}>
            Every lab documents the full journey — objective, architecture, real challenges, root causes,
            and working solutions. No shortcuts.
          </p>
        </div>

        {/* Labs */}
        <div className="flex flex-col gap-6">
          {labs.map((lab) => (
            <div
              key={lab.slug}
              className="rounded-3xl p-8 md:p-10 transition-all"
              style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Number */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-mono font-bold flex-shrink-0"
                  style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}
                >
                  {lab.number}
                </div>

                <div className="flex-1">
                  {/* Status + date */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: lab.status === "Completed" ? "#30d15820" : lab.status === "In Progress" ? "#2997ff20" : "var(--bg-alt)",
                        color: lab.status === "Completed" ? "#30d158" : lab.status === "In Progress" ? "var(--accent)" : "var(--text-3)",
                      }}
                    >
                      {lab.status}
                    </span>
                    <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>{lab.date}</span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3" style={{ color: "var(--text)" }}>
                    {lab.title}
                  </h2>
                  <p className="text-sm leading-relaxed mb-6 max-w-2xl" style={{ color: "var(--text-2)" }}>
                    {lab.description}
                  </p>

                  {/* Highlights */}
                  <div className="grid sm:grid-cols-2 gap-2 mb-6">
                    {lab.highlights.map((h) => (
                      <div key={h} className="flex items-start gap-2.5">
                        <span style={{ color: "var(--accent)" }} className="text-xs mt-0.5 flex-shrink-0">›</span>
                        <span className="text-sm" style={{ color: "var(--text-2)" }}>{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {lab.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {lab.status === "Completed" ? (
                    <Link
                      href={`/labs/${lab.slug}`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                      style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                    >
                      Read full case study →
                    </Link>
                  ) : (
                    <span className="text-sm" style={{ color: "var(--text-3)" }}>Coming soon</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
