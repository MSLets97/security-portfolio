import Link from "next/link";
import { LabWalkthrough, WalkthroughStep } from "@/components/LabWalkthrough";
import { FlowDiagram, DiagramRow } from "@/components/ArchitectureDiagram";
import { CodeAndDocs, CodeLink } from "@/components/CodeLinks";

const architecture: DiagramRow[] = [
  {
    boxes: [
      { title: "snet-wan", subtitle: "10.40.0.0/24", lines: ["OPNsense WAN · 10.40.0.4"], color: "perimeter" },
      { title: "snet-mgmt", subtitle: "10.40.1.0/24", lines: ["OPNsense LAN · 10.40.1.4", "Log Forwarder · 10.40.1.5"], color: "tooling" },
      { title: "snet-workload", subtitle: "10.40.2.0/24", lines: ["VM-Workload1 · Ubuntu 24.04", "10.40.2.4"], color: "internal" },
      { title: "snet-client", subtitle: "10.40.3.0/24", lines: ["VM-Client-User1 · Windows 2025", "10.40.3.4"], color: "internal" },
    ],
  },
];

const lanRules = [
  { action: "BLOCK", proto: "SMB", port: "445" },
  { action: "BLOCK", proto: "RDP", port: "3389" },
  { action: "BLOCK", proto: "RPC", port: "135" },
  { action: "BLOCK", proto: "NetBIOS", port: "139" },
  { action: "ALLOW", proto: "Default allow LAN to any", port: "—" },
];

const codeLinks: CodeLink[] = [
  {
    label: "main.tf — resources 15–19",
    href: "https://github.com/MSLets97/azure-opnsense-nva/blob/main/main.tf#L412-L519",
    description: "Workload route table, client/workload NICs, and the Windows Server 2025 / Ubuntu 24.04 VMs.",
  },
];

const walkthroughSteps: WalkthroughStep[] = [
  {
    title: "Provision the new subnets and VMs",
    what: "Terraform creates snet-workload (10.40.2.0/24) and snet-client (10.40.3.0/24), plus VM-Workload1 (Ubuntu 24.04) and VM-Client-User1 (Windows Server 2025).",
    how: "terraform apply, with an explicit computer_name attribute set on the Windows VM resource rather than relying on the longer Terraform resource name.",
    why: "Windows enforces a hard 15-character NetBIOS hostname limit, even on Server 2025. Azure defaults to using the Terraform resource name as the Windows computer name, so a resource name like VM-Client-User1-65s4 fails at apply time unless computer_name is set independently.",
    where: "PowerShell, in the Terraform project directory.",
  },
  {
    title: "Force all new-subnet traffic through OPNsense",
    what: "Attach a User-Defined Route (0.0.0.0/0 → next hop 10.40.1.4, OPNsense's LAN IP) to both snet-workload and snet-client.",
    how: "azurerm_route_table plus azurerm_subnet_route_table_association resources in Terraform, one per subnet.",
    why: "Without a UDR, Azure's default system routes send VM-to-VM and VM-to-internet traffic directly between subnets, completely bypassing OPNsense. The firewall can't enforce or log anything it never sees — the UDR is what makes OPNsense the mandatory chokepoint instead of an optional one.",
    where: "Terraform (main.tf), applied against the Azure VNet.",
  },
  {
    title: "Point OPNsense's LAN gateway at the real Azure gateway",
    what: "Set OPNsense's LAN gateway to 10.40.1.1 and add static routes for 10.40.2.0/24 and 10.40.3.0/24 via that gateway.",
    how: "System → Gateways and System → Routing in the OPNsense GUI.",
    why: "Azure always reserves .1 as the subnet's actual gateway address. A cloud-init default that doesn't match this (or missing static routes back to the new subnets) creates a return-path routing failure — outbound NAT looks correct in the firewall log, but replies never make it back to the originating VM, which looks identical to a firewall block until you check routing specifically.",
    where: "OPNsense GUI → System → Routing.",
  },
  {
    title: "Write LAN rules blocking lateral movement protocols",
    what: "Add explicit OPNsense LAN rules blocking SMB (445), RDP (3389), RPC (135), and NetBIOS (139) from the client subnet to the workload subnet, each with logging enabled.",
    how: "Firewall → Rules → LAN → Add, one rule per protocol/port, source 10.40.3.0/24, destination 10.40.2.0/24.",
    why: "These four protocols are exactly what a compromised workstation would use to pivot toward a server on the network — blocking them simulates a real east-west security control, and enabling logging on each one means every attempt is provable, not just theoretically blocked.",
    where: "OPNsense GUI → Firewall → Rules → LAN.",
  },
  {
    title: "Order the block rules above the default allow",
    what: "Move all four lateral-movement block rules above OPNsense's built-in \"Default allow LAN to any\" rule.",
    how: "Drag-and-drop the rules using the rule list's drag handles, then Apply Changes.",
    why: "OPNsense evaluates firewall rules top-to-bottom with first-match-wins, the same as pfSense. A block rule sitting below a catch-all allow rule will never fire — the allow rule already matched the traffic and let it through before the block rule is ever reached.",
    where: "OPNsense GUI → Firewall → Rules → LAN (rule ordering).",
  },
  {
    title: "Prove the blocks work end to end",
    what: "From the client VM, attempt connections to the workload VM on ports 445, 3389, 135, and 139, and confirm both the failure on the client and a matching block entry in Sentinel.",
    how: "PowerShell's Test-NetConnection from VM-Client-User1 (reached via WireGuard), cross-checked against the Sentinel Syslog table for the same timestamp.",
    why: "A rule isn't proven by configuration alone — you need to see both halves of the same event: the connection genuinely failing on the client side, and the block genuinely logged on the firewall side, at the same moment.",
    where: "PowerShell on the client VM + Microsoft Sentinel Logs blade.",
  },
];

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
            style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
          >
            <FlowDiagram rows={architecture} />
            <div className="mt-6 pt-5 space-y-1.5" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-xs font-mono" style={{ color: "var(--text-3)" }}>rt-snet-workload: 0.0.0.0/0 → NextHop 10.40.1.4 (OPNsense LAN)</p>
              <p className="text-xs font-mono" style={{ color: "var(--text-3)" }}>rt-snet-client: 0.0.0.0/0 → NextHop 10.40.1.4 (OPNsense LAN)</p>
            </div>
          </div>
        </section>

        {/* LAN rule order */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>OPNsense LAN Rules</h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-3)" }}>
            Evaluated top to bottom, first match wins — src 10.40.3.0/24 (client) → dst 10.40.2.0/24 (workload). All blocks log to Sentinel via filterlog.
          </p>
          <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {lanRules.map((r, i) => (
                <div key={i} className="px-8 py-4 flex items-center gap-4">
                  <span className="text-xs font-mono w-6 flex-shrink-0" style={{ color: "var(--text-3)" }}>{i + 1}</span>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium font-mono flex-shrink-0"
                    style={r.action === "BLOCK" ? { backgroundColor: "#ff453a18", color: "#ff453a" } : { backgroundColor: "#30d15820", color: "#30d158" }}
                  >
                    {r.action}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>{r.proto}</span>
                  {r.port !== "—" && <span className="text-xs font-mono ml-auto" style={{ color: "var(--text-3)" }}>port {r.port}</span>}
                </div>
              ))}
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

        {/* Code & Documentation */}
        <CodeAndDocs links={codeLinks} />

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
