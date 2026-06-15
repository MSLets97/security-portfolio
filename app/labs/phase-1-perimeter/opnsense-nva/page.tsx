import Link from "next/link";

const techs = [
  "Microsoft Azure", "Terraform (azurerm ~3.0)", "OPNsense (FreeBSD 14.1)",
  "WireGuard VPN", "Azure NSGs", "cloud-init", "Azure Virtual Network",
  "Azure Public IP", "Bash scripting",
];

const challenges = [
  {
    number: "01",
    title: "Azure Reserves .0–.3 in Every Subnet",
    problem: "SSH to the expected OPNsense LAN IP (10.40.1.1) kept timing out. Ping worked to 10.40.1.4 but not .1.",
    rootCause: "Azure automatically reserves the first four IP addresses in every subnet — network address, gateway, DNS, and broadcast. OPNsense's LAN NIC was dynamically assigned .4, not .1.",
    fix: "Found the actual IP via Azure Portal → Network Interfaces → NIC-VM-OPNsense-LAN → IP configuration. Updated all SSH and WireGuard references to 10.40.1.4.",
    lesson: "Azure subnets start at .4 for usable host addresses. Never assume .1 is the appliance — always verify via the portal NIC blade after deployment.",
  },
  {
    number: "02",
    title: "FreeBSD vs Linux Command Differences",
    problem: "Standard Linux diagnostic commands failed on the OPNsense shell. logger -n, tcpdump -i any, and several utilities produced errors or zero results.",
    rootCause: "OPNsense runs on FreeBSD, not Linux. FreeBSD uses different flags: logger uses -h instead of -n for a remote host; tcpdump requires a specific interface name (hn1) instead of the Linux -i any shortcut.",
    fix: "Switched to FreeBSD-correct syntax: logger -h 10.40.1.5 -P 514 -p local0.info 'test' and tcpdump -i hn1 -n port 514. Documented all BSD-specific diagnostic commands in the lab runbook.",
    lesson: "OPNsense is FreeBSD — treat it as a network appliance OS, not a Linux server. BSD-specific diagnostic commands must be documented from day one of the lab.",
  },
  {
    number: "03",
    title: "SSH Host Key Changed After VM Rebuild",
    problem: "After Terraform rebuilt the log forwarder VM, SSH from OPNsense to 10.40.1.5 showed REMOTE HOST IDENTIFICATION HAS CHANGED and refused to connect.",
    rootCause: "Every new VM gets a new SSH host key. The OPNsense known_hosts still had the old fingerprint from the previous build, causing a mismatch and a complete connection refusal.",
    fix: "Ran ssh-keygen -R 10.40.1.5 on the OPNsense shell to remove the stale key, then reconnected and accepted the new fingerprint.",
    lesson: "When Terraform rebuilds a VM, clear any SSH known_hosts entries for that IP on all other hosts that connect to it. This triggers whenever custom_data, OS disk, or the VM image changes.",
  },
];

const outcomes = [
  "OPNsense NVA deployed on Azure with correct WAN/LAN NIC assignment and IP addressing",
  "WireGuard VPN provides secure management access — no SSH or RDP port exposed on WAN",
  "WAN firewall rules block 22 and 3389 explicitly, with a catch-all rule logging all other blocked ports",
  "NAT outbound masquerade operational — internal VMs reach the internet through OPNsense",
  "Terraform provisions the full lab from scratch with a single apply — repeatable, version-controlled",
  "OPNsense filterlog generating block events for every dropped WAN connection attempt",
];

const roleSkills = [
  "Firewall NVA deployment and initial configuration from scratch",
  "WAN/LAN interface design and IP addressing on a cloud network appliance",
  "Terraform IaC for repeatable, auditable infrastructure provisioning",
  "WireGuard VPN for zero-trust management plane — no public management ports",
  "FreeBSD/network appliance diagnostics and troubleshooting",
  "Firewall rule logic: explicit blocks, catch-all logging, and rule ordering",
];

export default function OPNsenseNVAPage() {
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
          <span>OPNsense NVA</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              Lab 1.1
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#30d15820", color: "#30d158" }}>Completed</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>May 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            OPNsense NVA<br />Deployment.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Deploy OPNsense as a Network Virtual Appliance on Microsoft Azure using Terraform.
            Configure dual-NIC WAN/LAN networking, enforce perimeter firewall rules, establish
            WireGuard VPN for zero-trust management access, and prove it works at the packet level.
          </p>
        </div>

        {/* Objective */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Objective</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
              <p>
                Build the network perimeter layer from nothing: provision a FreeBSD-based firewall on Azure,
                configure it with separate WAN and LAN network interfaces, enforce firewall rules that
                restrict inbound internet access to WireGuard VPN only, and set up NAT for internal VM
                outbound access.
              </p>
              <p>
                Every resource is managed by Terraform — the deployment must be fully reproducible from
                a single apply. No manual portal configuration for core infrastructure.
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
  Internet (inbound connection attempts)
       │
       ▼
  ┌──────────────────────────────────────────┐
  │  Azure NSG — WAN-facing                  │
  │  Rule 100: Allow UDP 51820 (WireGuard)   │
  │  Rule 900: Deny all inbound              │
  └─────────────────┬────────────────────────┘
                    │ WireGuard tunnel only
                    ▼
  ┌──────────────────────────────────────────┐
  │  OPNsense NVA (FreeBSD 14.1)             │
  │  VM: Standard_B2s, 2 vCPU, 4 GB RAM      │
  │                                          │
  │  WAN hn0: 10.40.0.4 (snet-wan)           │
  │    Public IP: [dynamic]                  │
  │    Rule: Block TCP 22 (SSH)              │
  │    Rule: Block TCP 3389 (RDP)            │
  │    Rule: Pass UDP 51820 (WireGuard)      │
  │    Rule: Block + Log all other inbound   │
  │                                          │
  │  LAN hn1: 10.40.1.4 (snet-mgmt)         │
  │    NAT outbound masquerade on WAN        │
  │    DHCP disabled — static assignments    │
  │    Gateway for 10.40.1.0/24             │
  │    WireGuard peer: 10.10.10.0/24         │
  └──────────────────────────────────────────┘

  Provisioned entirely with Terraform:
  - azurerm_virtual_machine (FreeBSD image)
  - azurerm_network_interface × 2 (WAN, LAN)
  - azurerm_public_ip (WAN)
  - azurerm_network_security_group (WAN NSG)
  - azurerm_virtual_network + 2 subnets
  - cloud-init: OPNsense bootstrap script
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
              Network Security Engineers deploy and maintain firewalls daily. This lab replicates that
              work — configuring a real NVA, enforcing WAN security policy, and proving it blocks
              what it should block.
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
          <Link href="/labs/phase-1-perimeter" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← Phase 1 overview
          </Link>
          <Link href="/labs/phase-1-perimeter/network-segmentation" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Lab 1.2: Network Segmentation →
          </Link>
        </div>
      </div>
    </div>
  );
}
