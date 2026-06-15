import Link from "next/link";

const techs = [
  "Azure Virtual Network", "Azure Subnets", "User-Defined Routes (UDR)",
  "Azure Route Tables", "OPNsense LAN rules", "Windows Server 2025",
  "Ubuntu 24.04 LTS", "Azure NSGs", "Terraform (azurerm ~3.0)",
];

const challenges = [
  {
    number: "01",
    title: "Windows VM Name Exceeds 15-Character Limit",
    problem: "terraform apply failed with: computer_name can be at most 15 characters, got 20. The VM resource name was VM-Client-User1-65s4. The deployment blocked completely.",
    rootCause: "Azure uses the Terraform resource name as the Windows computer name by default. Windows has a hard 15-character NetBIOS hostname limit — a constraint that exists even in Windows Server 2025.",
    fix: "Added an explicit computer_name = \"ClientUser1\" attribute to the azurerm_windows_virtual_machine resource. The Azure resource name remains long; the Windows hostname is set independently.",
    lesson: "Always set computer_name explicitly on Windows VMs in Terraform when the resource name exceeds 15 characters. The azurerm provider does not warn about this until apply time.",
  },
  {
    number: "02",
    title: "OPNsense Wrong LAN Gateway — Return Path Routing Failure",
    problem: "The client VM (10.40.3.4) had no internet access after deployment. OPNsense Live View showed NAT and Pass on all outbound packets — but every ping timed out with zero replies, even to OPNsense's own LAN IP.",
    rootCause: "OPNsense's LAN gateway was configured as 10.0.1.1 — the default from the cloud-init bootstrap script. The actual Azure subnet gateway for snet-mgmt (10.40.1.0/24) is 10.40.1.1. OPNsense also had no static routes to the client (10.40.3.0/24) or workload (10.40.2.0/24) subnets, so return packets were silently dropped.",
    fix: "Corrected LAN_GW to 10.40.1.1 in OPNsense System → Gateways. Added static routes for 10.40.3.0/24 and 10.40.2.0/24 via the LAN gateway. Internet connectivity from the client VM was confirmed immediately after.",
    lesson: "Azure always reserves .1 as the subnet gateway. After any OPNsense cloud-init setup, verify the LAN gateway matches the actual Azure subnet .1 address. NAT+Pass with zero replies is always a return-path routing problem — not a firewall rule problem.",
  },
  {
    number: "03",
    title: "LAN Block Rules Below Allow Rule — Silently Doing Nothing",
    problem: "Added OPNsense LAN block rules for lateral movement traffic (SMB 445, RDP 3389, NetBIOS 139, RPC 135) between client and workload subnets. Test traffic still passed through — no block events appeared in OPNsense Live View or Sentinel.",
    rootCause: "The block rules were positioned below the Default allow LAN to any rule in the LAN rule list. OPNsense evaluates rules top-to-bottom with first-match-wins. Traffic from 10.40.3.4 matched the allow rule first and was passed before reaching any block rule.",
    fix: "Used the OPNsense rule drag handles to move all four lateral movement block rules above the Default allow LAN to any rule. Applied changes. Subsequent test traffic on ports 445, 3389, 135, and 139 immediately generated block log entries visible in Sentinel.",
    lesson: "In OPNsense and pfSense, rule order is everything. Block rules must always sit above catch-all allow rules. An Allow at position 3 and Block at position 6 means the allow always wins — check rule ordering before debugging any traffic that should be blocked.",
  },
];

const outcomes = [
  "Four isolated subnets operational: snet-wan, snet-mgmt, snet-workload (10.40.2.0/24), snet-client (10.40.3.0/24)",
  "UDRs on snet-workload and snet-client force all traffic through OPNsense LAN IP (10.40.1.4)",
  "VM-Workload1 (Ubuntu 24.04) and VM-Client-User1 (Windows Server 2025) deployed and reachable via WireGuard VPN",
  "East-west lateral movement blocked: SMB 445, RDP 3389, RPC 135, NetBIOS 139 from client to workload subnet",
  "OPNsense LAN block rules generating log entries in Sentinel for every blocked lateral movement attempt",
  "Two-layer defense confirmed: Azure NSG silently drops unknown ports; OPNsense logs and blocks what NSG allows through",
];

const roleSkills = [
  "Network segmentation design: subnet isolation by function (WAN, management, workload, client)",
  "User-Defined Routes for enforcing traffic flow through a security appliance",
  "East-west firewall rules: preventing lateral movement between internal segments",
  "Defense-in-depth: layering NSG controls with NVA firewall policies",
  "Troubleshooting routing failures at the return-path level",
  "First-match firewall rule evaluation logic and correct rule ordering",
];

export default function NetworkSegmentationPage() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-12" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--text-2)" }}>Home</Link>
          <span>/</span>
          <Link href="/labs" className="hover:underline" style={{ color: "var(--text-2)" }}>Labs</Link>
          <span>/</span>
          <Link href="/labs/phase-1-perimeter" className="hover:underline" style={{ color: "var(--text-2)" }}>Phase 1</Link>
          <span>/</span>
          <span>Network Segmentation</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              Lab 1.2
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#30d15820", color: "#30d158" }}>Completed</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>Jun 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            Network Segmentation<br />&amp; East-West Controls.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Extend the OPNsense NVA with isolated client and workload subnets, route all VM traffic
            through the firewall using Azure UDRs, and enforce east-west controls that block lateral
            movement — the kind of attack an insider threat or compromised VM would attempt.
          </p>
        </div>

        {/* Objective */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Objective</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
              <p>
                Add a Windows Server 2025 client VM and an Ubuntu 24.04 workload VM on separate isolated
                subnets. Configure Azure User-Defined Routes so that all traffic from these subnets passes
                through OPNsense before reaching any destination. Implement OPNsense LAN rules that block
                common lateral movement protocols between the client and workload segments.
              </p>
              <p>
                The goal is to prove that a compromised client VM cannot reach the workload VM using
                standard attack protocols — and that every blocked attempt is logged and visible in Sentinel.
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
  Azure VNet: 10.40.0.0/16
  ┌─────────────────────────────────────────────────────┐
  │                                                     │
  │  snet-wan        snet-mgmt      snet-workload       │
  │  10.40.0.0/24    10.40.1.0/24   10.40.2.0/24        │
  │  OPNsense WAN    OPNsense LAN   VM-Workload1        │
  │  10.40.0.4       10.40.1.4      Ubuntu 24.04        │
  │                  Log Fwd        10.40.2.4           │
  │                  10.40.1.5                          │
  │                                                     │
  │  snet-client                                        │
  │  10.40.3.0/24                                       │
  │  VM-Client-User1                                    │
  │  Windows Server 2025                                │
  │  10.40.3.4                                          │
  │                                                     │
  └─────────────────────────────────────────────────────┘

  User-Defined Routes (UDR):
  rt-snet-workload: 0.0.0.0/0 → NextHop 10.40.1.4 (OPNsense LAN)
  rt-snet-client:   0.0.0.0/0 → NextHop 10.40.1.4 (OPNsense LAN)

  OPNsense LAN rules (top to bottom — first match wins):
  ┌──────────────────────────────────────────────────────┐
  │ BLOCK  src 10.40.3.0/24  dst 10.40.2.0/24  p 445   │  SMB
  │ BLOCK  src 10.40.3.0/24  dst 10.40.2.0/24  p 3389  │  RDP
  │ BLOCK  src 10.40.3.0/24  dst 10.40.2.0/24  p 135   │  RPC
  │ BLOCK  src 10.40.3.0/24  dst 10.40.2.0/24  p 139   │  NetBIOS
  │ ALLOW  any  →  any  (Default allow LAN to any)      │
  └──────────────────────────────────────────────────────┘
  All blocked rules: logging enabled → filterlog → Sentinel
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
          <p className="text-sm mb-10" style={{ color: "var(--text-3)" }}>Three real engineering problems encountered and solved during this lab.</p>
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
              Network segmentation and lateral movement prevention are core NSE responsibilities.
              This lab shows the thinking behind proper subnet design and how to enforce it in practice —
              not just in policy, but at the packet level.
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
          <Link href="/labs/phase-1-perimeter/opnsense-nva" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← Lab 1.1: OPNsense NVA
          </Link>
          <Link href="/labs/phase-2-visibility" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Phase 2: Security Visibility →
          </Link>
        </div>
      </div>
    </div>
  );
}
