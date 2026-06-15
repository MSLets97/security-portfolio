import Link from "next/link";

const techs = [
  "Microsoft Azure", "Terraform (azurerm ~3.0)", "OPNsense (FreeBSD 14.1)",
  "Zenarmor (NGF plugin)", "WireGuard VPN", "syslog-ng", "rsyslog",
  "Azure Monitor Agent (AMA)", "Data Collection Rules (DCR)",
  "Microsoft Sentinel", "KQL", "Ubuntu 22.04", "Ubuntu 24.04 LTS",
  "Windows Server 2025", "Azure NSGs", "User-Defined Routes (UDR)",
  "Azure VNet Flow Logs", "Traffic Analytics", "Azure Network Watcher", "cloud-init",
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
    title: "syslog-ng Facility Mismatch — Zero Logs Flowing",
    problem: "syslog-ng destination showed written;0 even after confirming network connectivity. Manual logger tests worked; real firewall block events did not.",
    rootCause: "OPNsense's filterlog daemon uses the local0 syslog facility. The syslog-ng destination filter was configured for facility(local4). Every firewall event was silently discarded before reaching the forwarder.",
    fix: "Updated the syslog-ng destination config from facility(local4) to facility(local0) via the OPNsense GUI. Updated the Terraform DCR facility_names to [\"local0\"]. Confirmed with syslog-ng-ctl stats — written count went from 0 to non-zero immediately.",
    lesson: "written;0 with a non-zero s_all processed is the definitive syslog-ng signal that a filter is rejecting messages, not the network. Always verify with syslog-ng-ctl stats before assuming a connectivity problem.",
  },
  {
    number: "03",
    title: "AMA Running but Syslog Not Reaching Sentinel",
    problem: "Azure Monitor Agent showed Heartbeat in Sentinel but the Syslog table was completely empty. The agent appeared healthy.",
    rootCause: "AMA uses an internal service called azureotelcollector to ship syslog data. This service was installed but never enabled to start on boot — after every VM restart it was inactive (dead), silently dropping all syslog data.",
    fix: "Ran sudo systemctl start azureotelcollector to confirm it was the missing piece. Added systemctl enable azureotelcollector to the VM cloud-init in Terraform to make it permanent.",
    lesson: "AMA Heartbeat proves the agent binary is running. It says nothing about the syslog pipeline. Always verify azureotelcollector is active and enabled separately with systemctl status.",
  },
  {
    number: "04",
    title: "Terraform DCR Deletion Blocked by Sentinel",
    problem: "terraform apply failed with ExistingAssociationsPreventDelete when modifying the Data Collection Rule. The error blocked every subsequent apply.",
    rootCause: "When Microsoft Sentinel is enabled on a workspace, it auto-creates a DCR association on every VM in the resource group — including OPNsense. Terraform could not delete or modify the DCR while this association existed.",
    fix: "Navigated to Azure Portal → Monitor → Data Collection Rules → DCR-Syslog → Resources, removed the Sentinel-created association on vm-opnsense manually. Re-ran terraform apply successfully.",
    lesson: "Sentinel auto-creates DCR associations that Terraform does not manage. When you see ExistingAssociationsPreventDelete, always check Data Collection Rules → Resources in the portal for auto-created associations.",
  },
  {
    number: "05",
    title: "FreeBSD vs Linux Command Differences",
    problem: "Standard Linux diagnostic commands failed on the OPNsense shell. logger -n, tcpdump -i any, and PowerShell commands all produced errors or zero results.",
    rootCause: "OPNsense runs on FreeBSD, not Linux. FreeBSD uses different flags: logger uses -h instead of -n for a remote host; tcpdump requires a specific interface name (hn1) instead of the -i any shortcut.",
    fix: "Switched to FreeBSD-correct syntax: logger -h 10.40.1.5 -P 514 -p local0.info \"test\" and tcpdump -i hn1 -n port 514. PowerShell scripts were run on Windows, not the OPNsense shell.",
    lesson: "OPNsense is FreeBSD — treat it as an appliance OS, not Linux. Document BSD-specific diagnostic commands in the lab runbook from day one.",
  },
  {
    number: "06",
    title: "SSH Host Key Changed After VM Rebuild",
    problem: "After Terraform rebuilt the log forwarder VM, SSH from OPNsense to 10.40.1.5 showed REMOTE HOST IDENTIFICATION HAS CHANGED and refused to connect.",
    rootCause: "Every new VM gets a new SSH host key. The OPNsense known_hosts still had the old fingerprint from the previous build, causing a mismatch.",
    fix: "Ran ssh-keygen -R 10.40.1.5 on the OPNsense shell to remove the stale key, then reconnected and accepted the new fingerprint.",
    lesson: "When Terraform rebuilds a VM, clear any SSH known_hosts entries for that IP on all other hosts that connect to it. This triggers whenever custom_data, OS disk, or the VM image changes.",
  },
  {
    number: "07",
    title: "Sentinel Auto-Modifies DCR — Terraform Wants to Destroy It",
    problem: "After Sentinel was enabled, terraform plan showed the Data Collection Rule would be destroyed and recreated on every apply. The lab syslog pipeline would be broken each time.",
    rootCause: "Microsoft Sentinel automatically modifies DCRs after creation — adding kind=\"Linux\" and extra syslog facilities (local1–local7). Terraform detected this drift as configuration change and planned a destroy/recreate cycle.",
    fix: "Added lifecycle { ignore_changes = all } to the azurerm_monitor_data_collection_rule resource. Terraform now ignores all post-creation drift on the DCR without destroying it.",
    lesson: "Sentinel modifies DCRs after creation as part of workspace onboarding. Always add lifecycle ignore_changes = all to DCR resources when Sentinel is enabled on the workspace — otherwise every apply will try to replace the pipeline.",
  },
  {
    number: "08",
    title: "Windows VM Name Exceeds 15-Character Limit",
    problem: "terraform apply failed with: computer_name can be at most 15 characters, got 20. The deployment blocked completely.",
    rootCause: "The VM resource name was VM-Client-User1-65s4 (20 characters). Azure uses the resource name as the Windows computer name by default, but Windows has a hard 15-character NetBIOS hostname limit.",
    fix: "Added an explicit computer_name = \"ClientUser1\" attribute to the azurerm_windows_virtual_machine resource. The Azure resource name can remain long; the Windows hostname is set independently.",
    lesson: "Always set computer_name explicitly on Windows VMs in Terraform when the resource name exceeds 15 characters. The azurerm provider does not warn about this until apply time.",
  },
  {
    number: "09",
    title: "OPNsense Wrong LAN Gateway — Return Path Routing Failure",
    problem: "Client VM (10.40.3.4) had no internet access. OPNsense Live View showed NAT and Pass on all outbound packets — but every ping timed out with zero replies, even to OPNsense's own LAN IP.",
    rootCause: "OPNsense's LAN gateway was configured as 10.0.1.1 — the setup script default. The actual Azure subnet gateway for snet-mgmt (10.40.1.0/24) is 10.40.1.1. Additionally, OPNsense had no static routes to the client (10.40.3.0/24) or workload (10.40.2.0/24) subnets, so return packets were silently dropped with no log entry.",
    fix: "Corrected LAN_GW to 10.40.1.1 in OPNsense System → Gateways. Added static routes for 10.40.3.0/24 and 10.40.2.0/24 via the LAN gateway. Internet connectivity from client VM was confirmed immediately after.",
    lesson: "Azure always reserves the .1 address as the subnet gateway. After any OPNsense setup script, verify the LAN gateway matches the actual Azure subnet .1 address. NAT+Pass with zero replies is always a return-path routing problem — not a firewall rule problem.",
  },
  {
    number: "10",
    title: "OPNsense LAN Block Rules Below Allow Rule — Doing Nothing",
    problem: "Added block rules for lateral movement (SMB 445, RDP 3389, NetBIOS 139, RPC 135) from client to workload subnet. Test traffic still passed through — no block events appeared in OPNsense Live View or Sentinel.",
    rootCause: "The block rules were positioned below the Default allow LAN to any rule in the LAN rule list. OPNsense evaluates rules top-to-bottom with first-match-wins. Traffic from 10.40.3.4 matched the allow rule first and was passed before reaching any block rule.",
    fix: "Dragged the four lateral movement block rules above the Default allow LAN to any rule using the OPNsense rule drag handles. Applied changes. Subsequent test traffic (port 445, 3389, 135, 139) now generates block log entries visible in Sentinel.",
    lesson: "In OPNsense and pfSense, rule order is everything. Block rules must always sit above catch-all allow rules. The Allow rule at position 3 and Block rule at position 6 means the allow always wins. Check rule order before debugging any traffic that should be blocked.",
  },
  {
    number: "11",
    title: "NSG Flow Logs Retired — azurerm 4.x Required for Replacement",
    problem: "Terraform failed to create NSG flow logs with: NsgFlowLogCreationBlocked — creation of new NSG flow logs is blocked starting June 30, 2025. The VNet flow log replacement requires azurerm 4.x.",
    rootCause: "Azure retired NSG flow logs on June 30, 2025. VNet flow logs are the replacement but the target_resource_id attribute needed for VNet flow logs was only added in azurerm 4.x. Upgrading to 4.x would break the existing azurerm_virtual_machine resource used for OPNsense, which was removed in azurerm 4.0.",
    fix: "Managed the storage account via Terraform (azurerm_storage_account). Created the VNet flow log via Azure Portal pointing at the Terraform-managed storage account with Traffic Analytics forwarding to the Sentinel workspace. Documented the intentional split in code comments.",
    lesson: "NSG flow logs are fully retired as of June 30, 2025. VNet flow logs are the replacement and require azurerm 4.x. When a provider upgrade would break existing resources, manage the new resource via portal or azapi provider and document why it is not in Terraform state.",
  },
];

const outcomes = [
  "End-to-end pipeline operational — OPNsense blocks land in Sentinel Syslog table within minutes",
  "Port 22, 3389, 445, 4444 attack simulations visible in Sentinel after block",
  "KQL queries parse raw filterlog CSV into SrcIP, DstIP, DstPort, Action, Protocol columns",
  "WireGuard VPN provides secure management — no SSH port exposed on WAN interface",
  "Terraform provisions the entire lab from scratch with a single apply",
  "pfSense Content Hub parser installed in Sentinel for structured threat analysis",
  "Two-layer defense confirmed: NSG drops unknown ports silently; OPNsense logs and blocks what NSG allows through",
  "Real internet attack traffic observed after opening NSG — LDAP (389), Elasticsearch (9200), VNC (5800), Grafana (3000), Telnet (23) scanners blocked by OPNsense WAN rules within minutes",
  "Lateral movement blocked: SMB 445, RDP 3389, RPC 135, NetBIOS 139 blocked east-west between subnets via LAN rules",
  "Zenarmor next-gen plugin active on OPNsense — malicious domain blocked at DNS layer with cloud threat intelligence",
  "VNet Flow Logs ingested to AzureNetworkAnalytics_CL in Sentinel — full NSG allow/deny visibility for reporting",
];

export default function LabPage() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-12" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--text-2)" }}>Home</Link>
          <span>/</span>
          <Link href="/labs" className="hover:underline" style={{ color: "var(--text-2)" }}>Labs</Link>
          <span>/</span>
          <span>Azure NVA + Sentinel</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#30d15820", color: "#30d158" }}>
              Completed
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>Jun 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            Azure NVA +<br />Microsoft Sentinel.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Deploy OPNsense as a Network Virtual Appliance on Azure, build a structured syslog
            forwarding pipeline, and ingest firewall block events into Microsoft Sentinel —
            all provisioned with Terraform and debugged at the packet level.
          </p>
        </div>

        {/* Objective */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Objective</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
              <p>
                Build a production-grade cloud security monitoring lab on Microsoft Azure that demonstrates
                the full pipeline from network traffic block events to actionable threat intelligence in a SIEM.
              </p>
              <p>
                The lab must follow real security engineering principles: no SSH on WAN, infrastructure as code
                only, secure remote access via WireGuard VPN, and every firewall block event queryable in
                Microsoft Sentinel using KQL.
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
  Internet (real scanners: RDP brute force, LDAP, Elasticsearch, VNC probes)
       │
       ▼
  ┌──────────────────────────────────────────────────┐
  │             Azure NSG (WAN)                      │
  │  Allow: 22, 443, 3389, UDP 51820 (WireGuard)    │
  │  Deny:  all other ports (silently)               │
  │  VNet Flow Logs → stflowlogs → Traffic Analytics │
  └─────────────────────┬────────────────────────────┘
                        │ allowed ports reach NVA
                        ▼
  ┌──────────────────────────────────────────────────┐
  │      OPNsense NVA (FreeBSD) + Zenarmor           │
  │  WAN hn0: 10.40.0.4  (snet-wan  10.40.0.0/24)   │
  │  LAN hn1: 10.40.1.4  (snet-mgmt 10.40.1.0/24)   │
  │  WAN rules: block 22/3389 + log all blocked      │
  │  LAN rules: block SMB/RDP/RPC/NetBIOS east-west  │
  │  Zenarmor: cloud threat intel, domain blocking   │
  │  Static routes → 10.40.2.0/24, 10.40.3.0/24     │
  │  filterlog (local0) → syslog-ng → UDP 514        │
  └───────┬────────────────────────┬─────────────────┘
          │ UDR forces all         │ syslog UDP 514
          │ subnet traffic         ▼
          │ through OPNsense  ┌─────────────────────────────┐
          │                   │  Log Forwarder (Ubuntu 22)  │
          ├──────────────┐    │  10.40.1.5  (snet-mgmt)     │
          ▼              ▼    │  rsyslog + AMA + otelcol    │
  ┌─────────────┐ ┌──────────┤  └──────────────┬────────────┘
  │ snet-client │ │snet-work │                  │ HTTPS (AMA)
  │10.40.3.0/24 │ │10.40.2.0 │                  ▼
  │VM-Client    │ │VM-Work   │  ┌─────────────────────────────────┐
  │Windows 2025 │ │Ubuntu 24 │  │  Log Analytics + Sentinel       │
  │10.40.3.4    │ │10.40.2.4 │  │  Syslog: filterlog blocks       │
  └─────────────┘ └──────────┘  │  AzureNetworkAnalytics_CL:      │
                                 │  NSG + VNet flow data           │
                                 │  KQL threat hunting + alerts    │
                                 └─────────────────────────────────┘
`}</pre>
          </div>
        </section>

        {/* Technologies */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Technologies Used</h2>
          <div className="flex flex-wrap gap-2">
            {techs.map((t) => (
              <span
                key={t}
                className="px-4 py-2 rounded-full text-sm"
                style={{ backgroundColor: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Challenges */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>Challenges &amp; Solutions</h2>
          <p className="text-sm mb-10" style={{ color: "var(--text-3)" }}>
            Eleven real engineering problems encountered and solved during the build.
          </p>
          <div className="flex flex-col gap-5">
            {challenges.map((c) => (
              <div
                key={c.number}
                className="rounded-3xl p-8 transition-all"
                style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start gap-5 mb-6">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                    style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}
                  >
                    {c.number}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight pt-1.5" style={{ color: "var(--text)" }}>{c.title}</h3>
                </div>

                <div className="space-y-5 ml-15">
                  {[
                    { label: "Problem",    text: c.problem    },
                    { label: "Root Cause", text: c.rootCause  },
                    { label: "Fix",        text: c.fix        },
                  ].map((row) => (
                    <div key={row.label}>
                      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-3)" }}>
                        {row.label}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{row.text}</p>
                    </div>
                  ))}

                  {/* Key Learning */}
                  <div
                    className="rounded-2xl px-5 py-4"
                    style={{ backgroundColor: "var(--bg-alt)", borderLeft: `3px solid var(--accent)` }}
                  >
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "var(--accent)" }}>
                      Key Learning
                    </p>
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

        {/* What comes next */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-6" style={{ color: "var(--text)" }}>What Comes Next</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Suricata IDS/IPS",     desc: "Deep packet inspection and custom threat signatures on the existing OPNsense NVA." },
              { title: "Analytics Rules",       desc: "Automated Sentinel alerts that fire on specific attack patterns in the Syslog table." },
              { title: "SOAR Playbooks",        desc: "Automate incident response using Logic Apps triggered by Sentinel analytics rules." },
              { title: "MITRE ATT&CK Mapping",  desc: "Map all lab detections to ATT&CK techniques for structured threat coverage reporting." },
            ].map((n) => (
              <div key={n.title} className="rounded-2xl p-6" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <p className="font-semibold mb-2" style={{ color: "var(--text)" }}>{n.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{n.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Nav */}
        <div className="flex items-center justify-between pt-10" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/labs" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← All labs
          </Link>
          <Link href="/labs/suricata-ids" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Next: Suricata IDS →
          </Link>
        </div>
      </div>
    </div>
  );
}
