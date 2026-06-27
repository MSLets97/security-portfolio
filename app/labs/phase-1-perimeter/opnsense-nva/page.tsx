import Link from "next/link";
import { LabWalkthrough, WalkthroughStep } from "@/components/LabWalkthrough";
import { FlowDiagram, DiagramRow } from "@/components/ArchitectureDiagram";
import { CodeAndDocs, CodeLink } from "@/components/CodeLinks";

const architecture: DiagramRow[] = [
  { boxes: [{ title: "Internet", color: "perimeter", lines: ["inbound connection attempts"] }], arrowAfter: { label: "WireGuard tunnel only" } },
  {
    boxes: [{
      title: "Azure NSG — WAN-facing", color: "perimeter",
      lines: ["Rule 100: Allow UDP 51820 (WireGuard)", "Rule 900: Deny all inbound"],
    }],
    arrowAfter: {},
  },
  {
    boxes: [{
      title: "OPNsense NVA (FreeBSD 14.1)", color: "security",
      subtitle: "Standard_B2s · 2 vCPU · 4 GB RAM",
      lines: [
        "WAN hn0 10.40.0.4 — block 22, block 3389,",
        "pass UDP 51820, block+log the rest",
        "LAN hn1 10.40.1.4 — NAT outbound, gateway",
        "for 10.40.1.0/24, WireGuard peer 10.10.10.0/24",
      ],
    }],
  },
];

const codeLinks: CodeLink[] = [
  {
    label: "main.tf — resources 1–7",
    href: "https://github.com/MSLets97/net-sec-hybrid-lab/blob/main/main.tf#L26-L277",
    description: "VNet, subnets, WAN NSG, dual NICs, the OPNsense VM, the client route table, and the install provisioner.",
  },
  {
    label: "variables.tf",
    href: "https://github.com/MSLets97/net-sec-hybrid-lab/blob/main/variables.tf",
    description: "All input variables, including admin_ssh_source_cidr / admin_rdp_source_cidr for locking down WAN access.",
  },
];

const walkthroughSteps: WalkthroughStep[] = [
  {
    title: "Provision the network skeleton with Terraform",
    what: "A single terraform apply creates the VNet, WAN/LAN/workload/client subnets, the WAN-facing NSG, a public IP, and the OPNsense VM with its two NICs.",
    how: "Run from the project root; Terraform prompts interactively for the admin password at apply time and asks for a typed yes to confirm.",
    why: "Defining every resource as code means the lab can be destroyed and rebuilt identically every session — and keeping the admin password out of any file (only entered at the interactive prompt) means there's nothing sensitive sitting in a tfvars file that could leak.",
    where: "PowerShell, in the Terraform project directory.",
  },
  {
    title: "Log into OPNsense for the first time",
    what: "Open the OPNsense web UI at the VM's public IP and authenticate as root.",
    how: "Browse to https://<opnsense-public-ip>, accept the self-signed certificate warning, then sign in with the password set during terraform apply.",
    why: "The certificate warning is expected — OPNsense ships with a self-signed cert out of the box, not a sign of a problem. Logging in successfully is the first proof the VM booted and both NICs attached correctly, before any configuration begins.",
    where: "Browser, against the OPNsense WAN public IP shown in the Terraform output.",
  },
  {
    title: "Verify WAN and LAN interface assignment",
    what: "Confirm the WAN interface shows an address in the 10.40.0.x range and LAN shows 10.40.1.x, both marked UP.",
    how: "Interfaces → Overview in the OPNsense GUI.",
    why: "Azure automatically reserves the first four addresses in every subnet for its own platform use, so the appliance never actually gets the .1 address you might expect. Verifying the real assigned IPs upfront — rather than assuming .1 — avoids hours of confused troubleshooting later when something doesn't connect.",
    where: "OPNsense GUI → Interfaces → Overview.",
  },
  {
    title: "Set a strong root password inside OPNsense",
    what: "Change the root account's password to a strong, independently-chosen value inside the OPNsense GUI itself.",
    how: "System → Access → Users → edit root → set a 16+ character password → Save → re-authenticate.",
    why: "The Terraform admin_password is a one-time bootstrap credential typed at apply time. Rotating it inside the GUI creates a separate, stronger credential for the ongoing web session, so a single leaked value doesn't compromise both the infrastructure provisioning path and the live firewall.",
    where: "OPNsense GUI → System → Access → Users.",
  },
  {
    title: "Review the default firewall posture before changing anything",
    what: "Inspect the out-of-the-box WAN rules (default deny all inbound) and LAN rules (default allow outbound).",
    how: "Firewall → Rules → WAN, then Firewall → Rules → LAN — read-only at this stage.",
    why: "You have to know the starting baseline before adding anything. It's also the point where the two independent firewall layers become clear: Azure's NSG (platform-level, evaluated first) and OPNsense's own ruleset (inside the VM) are both in the path — traffic has to pass both, and opening a port in one without the other still results in a block.",
    where: "OPNsense GUI → Firewall → Rules.",
  },
  {
    title: "Lock WAN down explicitly and add the WireGuard exception",
    what: "Add explicit WAN rules blocking TCP 22 (SSH) and TCP 3389 (RDP), a pass rule for UDP 51820 (WireGuard), and a catch-all block-and-log rule for everything else.",
    how: "Firewall → Rules → WAN → Add, ordered top to bottom so the explicit rules are evaluated before the catch-all.",
    why: "SSH and RDP are the two ports almost every internet-facing host gets scanned for within minutes — blocking them explicitly (rather than relying only on default-deny) makes the intent visible in the ruleset itself. WireGuard is the single sanctioned remote-admin path, deliberately not riding on the standard SSH/RDP ports an attacker would target first.",
    where: "OPNsense GUI → Firewall → Rules → WAN.",
  },
  {
    title: "Prove the firewall is actually evaluating live traffic",
    what: "Check the firewall's connection state table and confirm your own browser session to the OPNsense web UI appears in it.",
    how: "Firewall → Diagnostics → States.",
    why: "A rule that looks correct in the configuration screen isn't proof it works. Seeing a real, live connection entry in the state table confirms OPNsense is actually inspecting and tracking real traffic, not just holding configuration that's never been exercised.",
    where: "OPNsense GUI → Firewall → Diagnostics → States.",
  },
];

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
            style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
          >
            <FlowDiagram rows={architecture} />
            <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-3)" }}>
                Provisioned entirely with Terraform
              </p>
              <p className="text-xs font-mono leading-relaxed" style={{ color: "var(--text-3)" }}>
                azurerm_virtual_machine (FreeBSD image) · azurerm_network_interface × 2 (WAN, LAN) ·
                azurerm_public_ip (WAN) · azurerm_network_security_group (WAN NSG) ·
                azurerm_virtual_network + 2 subnets · cloud-init OPNsense bootstrap script
              </p>
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

        {/* Code & Documentation */}
        <CodeAndDocs links={codeLinks} />

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
