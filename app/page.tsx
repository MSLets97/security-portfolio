import Link from "next/link";

const certs = [
  { name: "SC-200",    full: "Security Operations Analyst Associate", dot: "#2997ff", url: "https://learn.microsoft.com/api/credentials/share/en-us/MatomeSamsonLetsoalo-9758/A4132F9B71111DB?sharingId=7FDEA2F6BD6B2B9" },
  { name: "AZ-700",    full: "Azure Network Engineer Associate",       dot: "#30d158", url: "https://learn.microsoft.com/api/credentials/share/en-us/MatomeSamsonLetsoalo-9758/11166C4277C5E7F7?sharingId=7FDEA2F6BD6B2B9" },
  { name: "AZ-900",    full: "Azure Fundamentals",                     dot: "#30d158", url: "https://learn.microsoft.com/api/credentials/share/en-us/MatomeSamsonLetsoalo-9758/BB0F095EA1331ECD?sharingId=7FDEA2F6BD6B2B9" },
  { name: "Security+", full: "CompTIA SY0-701",                        dot: "#ff453a", url: "https://www.credly.com/badges/8dca6de5-29c2-4081-b472-e0e4bc2afbf1/linked_in_profile" },
];

const skills = [
  { category: "Network Security",      items: ["OPNsense NVA", "Stateful Firewalls", "Suricata IDS/IPS", "WireGuard VPN", "DNAT / NAT", "Hub-and-Spoke"] },
  { category: "Azure & Cloud",          items: ["Azure VNet", "NSGs", "UDR / Route Tables", "Azure Monitor Agent", "Terraform IaC", "Azure Functions"] },
  { category: "SIEM & Threat Ops",      items: ["Microsoft Sentinel", "KQL (Advanced)", "Analytics Rules", "Defender XDR", "MITRE ATT&CK", "Automation Rules"] },
  { category: "Log Pipeline",           items: ["syslog-ng", "rsyslog", "AMA", "Data Collection Rules", "CEF / Syslog", "Unbound DNS"] },
  { category: "Identity & Access",      items: ["Entra ID", "RBAC", "Conditional Access", "MFA", "Zero Trust", "Defender for Identity"] },
  { category: "Automation & Scripting", items: ["PowerShell", "KQL", "Terraform", "Logic Apps", "Webhooks", "Azure Functions"] },
];

const labs = [
  {
    slug: "azure-nva-siem",
    title: "Azure NVA + Microsoft Sentinel",
    description: "OPNsense as a Network Virtual Appliance in a hub-and-spoke Azure topology, with a full syslog pipeline into Microsoft Sentinel — provisioned entirely with Terraform.",
    tags: ["Azure", "OPNsense", "Sentinel", "Terraform", "WireGuard"],
    status: "Completed",
  },
  {
    slug: "suricata-ids",
    title: "Suricata IDS/IPS",
    description: "Suricata in active IPS prevention mode on OPNsense with Emerging Threats rule sets and custom signatures to detect Nmap SYN reconnaissance in real time.",
    tags: ["Suricata", "IDS/IPS", "OPNsense", "Snort Rules"],
    status: "In Progress",
  },
  {
    slug: "azure-soc",
    title: "Full Azure SOC",
    description: "Complete SOC with automated incident response, Sentinel analytics rules mapped to MITRE ATT&CK, SOAR playbooks, and threat intelligence integration.",
    tags: ["Sentinel", "SOAR", "Logic Apps", "Analytics Rules"],
    status: "Planned",
  },
];

const checklist = [
  { done: true,  text: "OPNsense NVA — hub-and-spoke topology" },
  { done: true,  text: "WireGuard VPN — zero WAN SSH exposure" },
  { done: true,  text: "syslog-ng → AMA → Sentinel pipeline" },
  { done: true,  text: "KQL threat hunting queries" },
  { done: false, text: "Suricata IDS/IPS with custom signatures" },
  { done: false, text: "Sentinel Analytics Rules & SOAR" },
  { done: false, text: "AZ-500 — Azure Security Engineer" },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-14"
        style={{ background: "var(--hero-glow)" }}
      >
        <div className="max-w-4xl mx-auto">
          <p
            className="text-sm font-medium tracking-widest uppercase mb-6"
            style={{ color: "var(--accent)" }}
          >
            Security Engineering Portfolio
          </p>

          <h1
            className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
            style={{ color: "var(--text)" }}
          >
            Building the{" "}
            <span style={{ color: "var(--accent)" }}>future</span>
            <br />
            of my defence.
          </h1>

          <p
            className="text-xl md:text-2xl font-light max-w-2xl mx-auto mb-3 leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            Matome Samson Letsoalo
          </p>
          <p
            className="text-base max-w-xl mx-auto mb-12 leading-relaxed"
            style={{ color: "var(--text-3)" }}
          >
            Cloud Security Analyst with 4+ years of experience, transitioning to Network Security Engineer
            by building every lab from scratch.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/labs"
              className="px-6 py-3 rounded-full text-sm font-medium transition-all"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              View Security Labs
            </Link>
            <a
              href="https://linkedin.com/in/mslets97"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-sm font-medium transition-all"
              style={{ backgroundColor: "var(--bg-alt)", color: "var(--text)", border: "1px solid var(--border)" }}
            >
              LinkedIn ↗
            </a>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap justify-center gap-12 mt-24 pt-12 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            {[
              { v: "4+", l: "Years Experience" },
              { v: "2+", l: "Years in SOC"     },
              { v: "4",  l: "Certifications"   },
              { v: "3",  l: "Labs Building"    },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-4xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{s.v}</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications ── */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--bg-alt)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-8 text-center" style={{ color: "var(--text-3)" }}>
            Certifications
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {certs.map((c) => (
              <a
                key={c.name}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-card rounded-2xl p-5 flex flex-col gap-2"
                style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)", textDecoration: "none" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.dot }} />
                    <span className="font-bold text-sm" style={{ color: "var(--text)" }}>{c.name}</span>
                  </div>
                  <span className="verify-label text-xs" style={{ color: "var(--accent)" }}>Verify ↗</span>
                </div>
                <p className="text-xs leading-snug" style={{ color: "var(--text-2)" }}>{c.full}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-32 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>About</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
              Hands-on.<br />From scratch.<br />Every time.
            </h2>
            <div className="space-y-5 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
              <p>
                I work as a Cloud Security Analyst at Nedscaper, monitoring and investigating 50+ security
                alerts weekly using Microsoft Sentinel and Defender XDR across managed client environments.
              </p>
              <p>
                Outside of work, I build real security labs on Azure — deploying tools from scratch,
                breaking them, debugging at the packet level, and documenting every challenge encountered.
                Each lab is a full engineering case study, not a tutorial walkthrough.
              </p>
              <p>
                The aim: master every security tool — firewall NVA, IDS/IPS, SOAR, and threat hunting —
                to grow from SOC analyst to Network Security Engineer.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-8">
              <a href="mailto:mslets6040@gmail.com" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                mslets6040@gmail.com
              </a>
              <span style={{ color: "var(--border-h)" }}>·</span>
              <span className="text-sm" style={{ color: "var(--text-3)" }}>Midrand, Gauteng</span>
            </div>
          </div>

          {/* Checklist card */}
          <div
            className="rounded-3xl p-8 transition-all"
            style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--text-3)" }}>
              What I am building
            </p>
            <div className="space-y-4">
              {checklist.map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: item.done ? "#30d15820" : "var(--bg-alt)" }}
                  >
                    {item.done && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#30d158" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color: item.done ? "var(--text)" : "var(--text-3)" }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--text-3)" }}>
              Nedscaper · Cloud Security Analyst · May 2024 – Present
            </div>
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      <section id="skills" className="py-32 px-6" style={{ backgroundColor: "var(--bg-alt)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-center" style={{ color: "var(--accent)" }}>Skills</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-16" style={{ color: "var(--text)" }}>
            Core technical expertise.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map((group) => (
              <div
                key={group.category}
                className="rounded-2xl p-6 transition-all"
                style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-3)" }}>
                  {group.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Labs ── */}
      <section id="labs" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-center" style={{ color: "var(--accent)" }}>Labs</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-4" style={{ color: "var(--text)" }}>
            Security lab portfolio.
          </h2>
          <p className="text-center text-base mb-16 max-w-xl mx-auto" style={{ color: "var(--text-2)" }}>
            Real labs. Real challenges. Real fixes. Every case study is documented from first principles.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {labs.map((lab) => (
              <div
                key={lab.slug}
                className="rounded-3xl p-7 flex flex-col transition-all group"
                style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
              >
                <div className="mb-5">
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: lab.status === "Completed" ? "#30d15820" : lab.status === "In Progress" ? "#2997ff20" : "var(--bg-alt)",
                      color: lab.status === "Completed" ? "#30d158" : lab.status === "In Progress" ? "var(--accent)" : "var(--text-3)",
                    }}
                  >
                    {lab.status}
                  </span>
                </div>
                <h3 className="font-semibold text-base mb-2 leading-snug" style={{ color: "var(--text)" }}>{lab.title}</h3>
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "var(--text-2)" }}>{lab.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {lab.tags.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                      {t}
                    </span>
                  ))}
                </div>
                {lab.status === "Completed" ? (
                  <Link href={`/labs/${lab.slug}`} className="text-sm font-medium transition-colors" style={{ color: "var(--accent)" }}>
                    Read case study →
                  </Link>
                ) : (
                  <span className="text-sm" style={{ color: "var(--text-3)" }}>Coming soon</span>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/labs"
              className="text-sm font-medium px-6 py-3 rounded-full inline-block transition-all"
              style={{ backgroundColor: "var(--bg-alt)", color: "var(--text)", border: "1px solid var(--border)" }}
            >
              View all labs
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6" style={{ backgroundColor: "var(--bg-alt)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6" style={{ color: "var(--text)" }}>
            Open to the right opportunity.
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: "var(--text-2)" }}>
            Targeting Network Security Engineer, Cloud Security Engineer, and Detection Engineer roles.
            One month notice. Based in Midrand — open to Johannesburg and hybrid.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:mslets6040@gmail.com"
              className="px-8 py-3.5 rounded-full text-sm font-medium transition-all"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              Get in touch
            </a>
            <a
              href="https://linkedin.com/in/mslets97"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-full text-sm font-medium transition-all"
              style={{ backgroundColor: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
