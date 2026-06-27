import Link from "next/link";
import { FlowDiagram, DiagramRow } from "@/components/ArchitectureDiagram";
import { KeyLearningsRollup, KeyLearning } from "@/components/KeyLearningsRollup";
import { ProblemNarrative } from "@/components/ProblemNarrative";
import { ChallengesLessons } from "@/components/ChallengesLessons";
import { KeyMetrics } from "@/components/KeyMetrics";
import { BuildSequence, BuildStep } from "@/components/BuildSequence";

const problemNarrative =
  "Needed a production-grade perimeter firewall on Azure without using Azure Firewall's $1,000/month cost. " +
  "Deployed OPNsense as a dual-homed NVA with full hub-and-spoke IaC in Terraform, including WireGuard for " +
  "zero-trust management access. Result: fully functional four-subnet segmented architecture with stateful " +
  "inspection and VPN for under $20/month.";

const lessonsLearned = [
  "Discovered that OPNsense on Azure requires IP forwarding enabled on BOTH NICs separately — enabling it on only the WAN NIC caused routing to silently fail with no error message.",
  "Terraform's remote-exec provisioner requires the VM to be fully booted before SSH is available — added a depends_on and sleep timer to prevent race conditions on first deploy.",
  "WireGuard VPN on OPNsense requires the WireGuard interface to be added to the LAN firewall rules, not the WAN rules — took significant debugging to understand the traffic flow.",
  "Azure NSGs and OPNsense firewall rules are independent layers — traffic blocked at NSG level never reaches OPNsense, which means NSG rules must be permissive enough to let OPNsense handle the actual inspection.",
];

const keyMetrics = [
  { label: "Terraform Resources", value: "31 managed resources" },
  { label: "Monthly Cost", value: "<$20 USD (Azure B-series VMs)" },
  { label: "Subnets Deployed", value: "4 (WAN, MGMT, Workload, Client)" },
  { label: "VPN Protocol", value: "WireGuard (UDP 51820)" },
  { label: "IaC Footprint", value: "~750 lines of Terraform" },
];

const buildSequence: BuildStep[] = [
  { title: "Design the VNet topology (4 subnets, IP ranges, routing)" },
  { title: "Write Terraform for networking (VNet, subnets, NSGs, route tables)" },
  { title: "Deploy OPNsense VM with dual NICs (WAN + LAN)" },
  { title: "Enable IP forwarding on both NICs" },
  { title: "Configure OPNsense firewall rules (allow LAN-to-WAN, block inbound)" },
  { title: "Deploy WireGuard VPN for management access" },
  { title: "Deploy workload and client VMs, configure UDR routing through OPNsense" },
  { title: "Verify traffic flows correctly through the NVA" },
];

const keyLearnings: KeyLearning[] = [
  { source: "Lab 1.1 — OPNsense NVA", lesson: "Azure subnets start at .4 for usable host addresses. Never assume .1 is the appliance — always verify via the portal NIC blade after deployment." },
  { source: "Lab 1.1 — OPNsense NVA", lesson: "OPNsense is FreeBSD — treat it as a network appliance OS, not a Linux server. BSD-specific diagnostic commands (logger -h, tcpdump -i hn1) must be documented from day one." },
  { source: "Lab 1.1 — OPNsense NVA", lesson: "When Terraform rebuilds a VM, clear any SSH known_hosts entries for that IP on all other hosts that connect to it." },
  { source: "Lab 1.2 — Network Segmentation", lesson: "Always set computer_name explicitly on Windows VMs in Terraform when the resource name exceeds 15 characters — the azurerm provider doesn't warn until apply time." },
  { source: "Lab 1.2 — Network Segmentation", lesson: "Azure always reserves .1 as the subnet gateway. NAT+Pass with zero replies is always a return-path routing problem — not a firewall rule problem." },
  { source: "Lab 1.2 — Network Segmentation", lesson: "In OPNsense and pfSense, rule order is everything. Block rules must always sit above catch-all allow rules, since rules evaluate top-to-bottom with first-match-wins." },
];

const architecture: DiagramRow[] = [
  {
    boxes: [{ title: "Internet", color: "perimeter" }],
    arrowAfter: { label: "all inbound connection attempts" },
  },
  {
    boxes: [{
      title: "Azure NSG (WAN-facing)",
      color: "perimeter",
      lines: ["Allow: UDP 51820 (WireGuard only)", "Deny: all other inbound"],
    }],
    arrowAfter: {},
  },
  {
    boxes: [{
      title: "OPNsense NVA (FreeBSD 14.1)",
      color: "security",
      subtitle: "WAN hn0 10.40.0.4  ·  LAN hn1 10.40.1.4",
      lines: ["WAN rules: block 22 / 3389, log the rest", "LAN rules: block SMB/RDP/RPC/NetBIOS", "NAT: outbound masquerade on WAN"],
    }],
    arrowAfter: { label: "UDR forces all subnet traffic through here" },
  },
  {
    boxes: [
      { title: "snet-mgmt", subtitle: "10.40.1.0/24", lines: ["Log Forwarder · 10.40.1.5"], color: "tooling" },
      { title: "snet-workload", subtitle: "10.40.2.0/24", lines: ["VM-Workload1 · Ubuntu 24.04"], color: "internal" },
      { title: "snet-client", subtitle: "10.40.3.0/24", lines: ["VM-Client · Windows 2025"], color: "internal" },
    ],
  },
];

const labs = [
  {
    slug: "opnsense-nva",
    number: "1.1",
    title: "OPNsense NVA Deployment",
    description: "Deploy OPNsense as a Network Virtual Appliance on Azure using Terraform. Configure WAN/LAN NICs, firewall rules, WireGuard VPN for zero-trust management access, and NAT for outbound traffic.",
    skills: ["Firewall deployment", "Terraform IaC", "WireGuard VPN", "NAT configuration", "FreeBSD operations"],
    status: "Completed",
    date: "May 2026",
  },
  {
    slug: "network-segmentation",
    number: "1.2",
    title: "Network Segmentation & East-West Controls",
    description: "Add client and workload VMs across isolated subnets, route all traffic through OPNsense using User-Defined Routes, and enforce east-west lateral movement controls with OPNsense LAN firewall rules.",
    skills: ["Network segmentation", "User-Defined Routes", "East-west firewall controls", "Lateral movement prevention", "Defense in depth"],
    status: "Completed",
    date: "Jun 2026",
  },
];

const nseMapping = [
  { skill: "Firewall Rule Management", detail: "Designing and enforcing WAN/LAN policies, block rules with logging, rule ordering logic" },
  { skill: "Network Architecture", detail: "Hub-and-spoke topology, subnet isolation, default deny perimeter with explicit allow lists" },
  { skill: "Infrastructure as Code", detail: "Full Terraform provisioning — VMs, NICs, NSGs, VNets, route tables, cloud-init" },
  { skill: "VPN & Remote Access", detail: "WireGuard VPN tunnel for all management — no SSH, no RDP exposed on WAN" },
  { skill: "Network Troubleshooting", detail: "Debugging routing failures, return-path issues, NIC configuration at packet level" },
];

export default function Phase1Page() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-12" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--text-2)" }}>Home</Link>
          <span>/</span>
          <Link href="/labs" className="hover:underline" style={{ color: "var(--text-2)" }}>Labs</Link>
          <span>/</span>
          <span>Phase 1</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              Phase 01
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#30d15820", color: "#30d158" }}>
              Completed
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>May – Jun 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            Perimeter Security &<br />Network Architecture.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Build the foundation: deploy OPNsense as a cloud NVA, design a four-subnet network with
            proper isolation, enforce perimeter firewall rules, and establish secure management access
            via WireGuard VPN — with zero public-facing ports.
          </p>
        </div>

        <ProblemNarrative text={problemNarrative} />

        {/* What this phase proves */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>What This Phase Proves</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-2)" }}>
              Network Security Engineers spend the majority of their time designing, deploying, and
              maintaining firewall infrastructure and network segmentation. This phase replicates that
              work on Azure: standing up an NVA from scratch, configuring it correctly, and proving it
              enforces the intended security policy.
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
            style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
          >
            <FlowDiagram rows={architecture} />
            <div className="mt-6 pt-5 space-y-1.5" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-xs font-mono" style={{ color: "var(--text-3)" }}>UDR on snet-workload: 0.0.0.0/0 → 10.40.1.4</p>
              <p className="text-xs font-mono" style={{ color: "var(--text-3)" }}>UDR on snet-client: 0.0.0.0/0 → 10.40.1.4</p>
              <p className="text-xs mt-3" style={{ color: "var(--text-3)" }}>
                Admin access: WireGuard VPN (10.10.10.0/24) only — no SSH or RDP exposed on WAN.
              </p>
            </div>
          </div>
        </section>

        {/* Labs */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>Labs in This Phase</h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>Two labs that build the perimeter from nothing.</p>
          <div className="flex flex-col gap-5">
            {labs.map((lab) => (
              <div
                key={lab.slug}
                className="rounded-3xl p-8"
                style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start gap-5 mb-5">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                    style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}
                  >
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
                        <span key={s} className="text-xs px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/labs/phase-1-perimeter/${lab.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium"
                      style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                    >
                      Read case study →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Build Sequence */}
        <BuildSequence steps={buildSequence} />

        {/* Key Metrics */}
        <KeyMetrics metrics={keyMetrics} />

        {/* Challenges & Lessons Learned */}
        <ChallengesLessons items={lessonsLearned} />

        {/* Key Learnings */}
        <KeyLearningsRollup items={keyLearnings} />

        {/* Nav */}
        <div className="flex items-center justify-between pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/labs" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← All phases
          </Link>
          <Link href="/labs/phase-2-visibility" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Phase 2: Security Visibility →
          </Link>
        </div>
      </div>
    </div>
  );
}
