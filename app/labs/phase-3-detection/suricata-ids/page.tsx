import Link from "next/link";
import { LabWalkthrough, WalkthroughStep } from "@/components/LabWalkthrough";
import { FlowDiagram, DiagramRow } from "@/components/ArchitectureDiagram";
import { CodeAndDocs, CodeLink } from "@/components/CodeLinks";

const architecture: DiagramRow[] = [
  { boxes: [{ title: "Inbound WAN traffic", subtitle: "internet", color: "perimeter" }], arrowAfter: {} },
  {
    boxes: [{
      title: "Suricata 8.0.5 — Netmap (IPS)", color: "security",
      lines: [
        "Scoped to WAN only · promiscuous mode off",
        "1. Match ET Open: scan, attack_response, botcc,",
        "   compromised, drop, exploit, malware",
        "2. Match custom sig sid:9000001 (SYN flood/5s)",
        "3. drop = packet discarded, never forwarded",
      ],
    }],
    arrowAfter: { label: "traffic that doesn't match any drop rule" },
  },
  {
    boxes: [{ title: "OPNsense firewall + Zenarmor NGF", color: "security" }],
  },
];

const codeLinks: CodeLink[] = [
  {
    label: "scripts/configure_ips.py.tpl",
    href: "https://github.com/MSLets97/net-sec-hybrid-lab/blob/main/scripts/configure_ips.py.tpl",
    description: "A companion Terraform/API automation for the general IPS settings (enable, mode, WAN interface, ET Open). This lab's custom Nmap signature and capture-mode tuning were done directly in the OPNsense GUI, as documented above — this script is a separate, repeatable alternative for the baseline settings, not what produced the walkthrough above.",
  },
];

const techs = [
  "Suricata 8.0.5 (os-suricata plugin)", "OPNsense 26.1.9", "Netmap inline capture",
  "Emerging Threats Open ruleset", "Custom Snort-format signatures", "Syslog forwarding to Sentinel",
];

const walkthroughSteps: WalkthroughStep[] = [
  {
    title: "Install the Suricata plugin",
    what: "Install os-suricata from the OPNsense plugin repository.",
    how: "System → Firmware → Plugins, search \"suricata\", click the install (+) icon next to os-suricata.",
    why: "OPNsense ships IDS/IPS as an optional plugin rather than bundling it by default — this keeps the base firewall lean and lets the engine version be upgraded independently of the OPNsense OS itself (the lab is running OPNsense 26.1.9 with Suricata engine 8.0.5, two separate version numbers that update on their own schedules).",
    where: "OPNsense GUI → System → Firmware → Plugins.",
  },
  {
    title: "Choose the capture mode: Netmap (IPS), not PCAP (IDS)",
    what: "Set Capture mode to Netmap (IPS) instead of the default PCAP live mode (IDS).",
    how: "Services → Intrusion Detection → Administration → Settings → Capture mode dropdown.",
    why: "PCAP live mode is passive — Suricata gets a copy of traffic and can only log/alert, it physically cannot drop a packet. Netmap mode is inline: traffic passes through Suricata before continuing, which is the only way a drop rule can actually discard a packet. The lab's objective is to prove active prevention (block the scan, not just see it), so passive IDS mode doesn't satisfy the requirement. Divert (IPS) is the fallback if Netmap's driver requirements aren't met on a given NIC.",
    where: "OPNsense GUI → Services → Intrusion Detection → Administration → Settings.",
  },
  {
    title: "Leave Promiscuous mode unchecked",
    what: "Do not enable Promiscuous mode on the capture interface.",
    how: "Leave the Promiscuous mode checkbox on the same Settings page unchecked.",
    why: "Promiscuous mode makes a NIC capture every frame it physically sees, even ones not addressed to it — needed when a NIC is watching a copy of traffic on a SPAN/mirror port. That's not this setup: OPNsense's WAN NIC is the actual inline gateway path, so it already sees 100% of relevant WAN traffic as part of its normal job. There's no mirrored copy to pick up, so promiscuous mode adds CPU overhead with zero benefit, and on Azure's virtual Hyper-V NIC it can introduce driver quirks for no gain.",
    where: "OPNsense GUI → Services → Intrusion Detection → Administration → Settings.",
  },
  {
    title: "Scope the Interfaces selection to WAN only",
    what: "Select only WAN under Interfaces; deselect LAN and the WireGuard interface.",
    how: "Multi-select field on the Settings page — click to toggle each interface off except WAN.",
    why: "Two reasons. First, scope: the lab is detecting internet-sourced reconnaissance, which only crosses the WAN interface — watching LAN traffic too is just noise for this objective. Second, and more important: WireGuard is the only remote-admin path into this firewall. If Suricata is also inline on the WireGuard interface and a custom rule ever misfires on legitimate VPN traffic, a drop action could lock out remote access entirely with no other way in. Keeping IPS scoped to WAN-only means even a bad rule can never touch the management path.",
    where: "OPNsense GUI → Services → Intrusion Detection → Administration → Settings.",
  },
  {
    title: "Leave Pattern matcher on Aho-Corasick",
    what: "Keep the default Aho-Corasick pattern matcher algorithm.",
    how: "No change needed — it's the default value on the Settings page.",
    why: "With thousands of Emerging Threats rules active, Suricata needs to check every packet payload against all of them efficiently in one pass rather than one rule at a time. Aho-Corasick is the well-tested multi-pattern matching algorithm that does exactly that. There's no reason to trade a proven default for an alternative in this lab.",
    where: "OPNsense GUI → Services → Intrusion Detection → Administration → Settings.",
  },
  {
    title: "Leave syslog alerting and EVE syslog output enabled",
    what: "Keep \"Enable syslog alerts\" and \"Enable eve syslog output\" checked.",
    how: "No change needed — both ship checked by default on this OPNsense version.",
    why: "These two settings are the exact mechanism that routes Suricata alerts into the same syslog pipeline already built for OPNsense's firewall filterlog (syslog → Log Forwarder VM → Microsoft Sentinel). Because they're already enabled, no extra configuration step is needed later to get IDS/IPS alerts into Sentinel — it reuses infrastructure from Lab 2.1 instead of building a second log path.",
    where: "OPNsense GUI → Services → Intrusion Detection → Administration → Settings.",
  },
  {
    title: "Leave Rotate log on Weekly",
    what: "Keep the local alert log rotation interval at its default, Weekly.",
    how: "No change needed.",
    why: "This only controls disk housekeeping for the local alert log file on OPNsense — it has no effect on detection, blocking, or what reaches Sentinel, so the default is fine for a lab of this size.",
    where: "OPNsense GUI → Services → Intrusion Detection → Administration → Settings.",
  },
  {
    title: "Enable the Emerging Threats Open ruleset",
    what: "Turn on the ET Open ruleset and download/update the actual signature files.",
    how: "Administration → Rules → Rulesets, enable ET Open, Save, then click Update Rules and wait for the download to finish.",
    why: "Installing the plugin and configuring IPS mode only turns the engine on — without an actual ruleset loaded, there are no signatures to match traffic against. ET Open is the free, community-maintained Suricata ruleset and is the standard starting point before adding anything custom.",
    where: "OPNsense GUI → Services → Intrusion Detection → Administration → Rules.",
  },
  {
    title: "Enable the rule categories relevant to this lab's threat scope",
    what: "Turn on emerging-scan and emerging-attack_response for the recon-detection objective, plus botcc, compromised, drop, exploit, and malware for broader internet-facing threat coverage.",
    how: "Filter the rule browser by category, enable each, click Apply.",
    why: "ET Open ships thousands of rules covering everything from malware C2 to exploit kits — enabling every category at once overloaded the single-core Azure B1ms VM running OPNsense. Scoping to these seven categories keeps detection coverage broad (recon, known-bad IPs via Spamhaus DROP and CINS, exploits, malware, C2) without the CPU cost of loading the full ruleset.",
    where: "OPNsense GUI → Services → Intrusion Detection → Administration → Rules.",
  },
  {
    title: "Write a custom signature for Nmap SYN scans",
    what: "Add a custom Suricata rule that drops repeated SYN-only packets from the same source.",
    how: `Administration → Rules → User Defined, add:\ndrop tcp any any -> $HOME_NET any (msg:"CUSTOM Nmap SYN Scan Detected - Multiple SYN no ACK"; flags:S; threshold:type threshold, track by_src, count 15, seconds 5; classtype:attempted-recon; sid:9000001; rev:1;)\nSave, Apply, then Update Rules again so the custom signature loads.`,
    why: "ET Open's generic scan rules are a good baseline, but writing one signature by hand demonstrates the actual skill of authoring detection logic, not just consuming someone else's. flags:S matches the SYN-only packets a stealth scan produces (a real handshake completes the connection; a scanner usually doesn't). The threshold clause (15 hits in 5 seconds) exists specifically so a normal user's occasional connection attempt is never mistaken for a scan — only a burst pattern fires it. sid:9000001 is in the 9000000+ range OPNsense reserves for local/custom rules, which avoids ever colliding with an ET Open signature ID.",
    where: "OPNsense GUI → Services → Intrusion Detection → Administration → Rules → User Defined.",
  },
  {
    title: "Point Suricata alerts at Sentinel via the local5 facility",
    what: "Add a second OPNsense remote syslog destination carrying the suricata application name on facility local5, separate from the existing local0 firewall filterlog destination, and add local5 to the Azure DCR's syslog data source.",
    how: "System → Settings → Logging / targets → Add a destination scoped to the suricata app + local5 facility; then add local5 to facility_names in the Terraform DCR resource.",
    why: "Suricata logs to local5 by default on OPNsense, not local4 as an earlier internal doc draft assumed — confirmed by reading Suricata's own startup log, which states the facility explicitly on initialization. Both the app name and the facility have to be set on the syslog destination; setting only one silently drops every Suricata alert before it leaves OPNsense.",
    where: "OPNsense GUI → System → Settings → Logging / targets + Terraform main.tf (DCR resource).",
  },
  {
    title: "Test with a real Nmap SYN scan and confirm the block",
    what: "Run nmap -sS -p 1-1000 against the OPNsense WAN public IP from an external machine, then check both OPNsense and Sentinel for the resulting alert.",
    how: "From a machine outside the lab VNet (a separate cloud VM or home connection — never from inside the same VNet, since client-to-WAN traffic wouldn't cross the WAN Suricata instance), run the scan, then check Administration → Logs → Alerts on OPNsense for sid:9000001, and a Sentinel KQL query against the Syslog table for the same event.",
    why: "Configuration without a live-fire test is unverified. A successful test shows three things at once: the scan itself hangs/times out (proof packets are being dropped, not just logged), the custom signature fires locally on OPNsense, and the same alert is independently visible in Sentinel — proving the entire chain from packet to SIEM end to end.",
    where: "External test machine (nmap) + OPNsense Logs + Microsoft Sentinel Logs.",
  },
];

const challenges = [
  {
    number: "01",
    title: "Guide Assumed an Outdated Suricata UI",
    problem: "The initial lab guide was written assuming a legacy OPNsense Suricata interface — a separate \"Interfaces\" tab with a per-interface \"+Add\" button and a simple \"IPS mode\" checkbox.",
    rootCause: "OPNsense 25.x/26.x consolidated Suricata configuration into a single unified Administration → Settings page, with a Capture mode dropdown (PCAP live mode / Netmap / Divert) replacing the old binary IPS checkbox, plus a multi-select Interfaces field instead of per-interface entries.",
    fix: "Re-verified the actual settings page against a live screenshot of the running OPNsense 26.1.9 instance before writing any further configuration steps, and corrected the guide to document the real unified-page workflow.",
    lesson: "OPNsense plugin UIs change between major versions. Never document a configuration workflow purely from memory or an older guide — confirm against the live, running version of the actual tool before publishing steps.",
  },
  {
    number: "02",
    title: "Suricata Alerts Never Reached Sentinel — Wrong Syslog Facility",
    problem: "EVE JSON alerts were confirmed firing locally in OPNsense's own alert log, but nothing from Suricata ever appeared in the Sentinel Syslog table, even though the existing OPNsense filterlog → Sentinel pipeline from Phase 2 was working fine for firewall events.",
    rootCause: "Suricata logs to syslog facility local5 on OPNsense by default — not local4, which an earlier internal draft of the lab notes assumed. The remote syslog destination also only had the facility set, not the suricata application name, so even after the facility was corrected the destination still wasn't selective enough to confirm which alerts were Suricata's.",
    fix: "Read Suricata's own startup log, which states the facility explicitly on initialization, confirming local5. Added a syslog destination scoped to both the suricata app name and facility local5, and added local5 to the Terraform DCR's facility_names so Sentinel's data collection rule would actually accept it.",
    lesson: "A syslog facility mismatch fails completely silently — no error on either end. When one log source on a shared pipeline works (filterlog) and another doesn't (Suricata), check facility and app-name scoping on the syslog destination before assuming the whole pipeline is broken.",
  },
];

export default function SuricataIDSPage() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-12" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--text-2)" }}>Home</Link>
          <span>/</span>
          <Link href="/labs" className="hover:underline" style={{ color: "var(--text-2)" }}>Labs</Link>
          <span>/</span>
          <Link href="/labs/phase-3-detection" className="hover:underline" style={{ color: "var(--text-2)" }}>Phase 3</Link>
          <span>/</span>
          <span>Suricata IDS/IPS</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              Lab 3.2
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#2997ff20", color: "#2997ff" }}>In Progress</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>Jun 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            Suricata IDS/IPS<br />&amp; Custom Signatures.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Deploy Suricata on OPNsense in active inline IPS mode — not just alerting, actually
            dropping malicious packets — enable the Emerging Threats Open ruleset, and write a
            custom signature that detects and blocks Nmap SYN reconnaissance scans in real time.
          </p>
        </div>

        {/* Objective */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Objective</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
              <p>
                OPNsense's stateful firewall rules and Zenarmor's next-gen inspection both make
                allow/block decisions based on address, port, domain, or application identity. Neither
                inspects packet payloads against known attack signatures. This lab adds that capability:
                Suricata running inline on the WAN interface, matching every packet against the Emerging
                Threats Open ruleset plus a hand-written signature, and dropping matches in real time.
              </p>
              <p>
                The interface scope is deliberately narrow — WAN only — so that a misbehaving custom rule
                can never interfere with the WireGuard VPN tunnel used for remote administration of this
                firewall.
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
            <div className="mt-6 pt-5 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                Alert path (parallel to the block decision): Suricata EVE alert → syslog → Log Forwarder
                VM → Sentinel — reuses the Phase 2 syslog pipeline, no new log path built.
              </p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                WireGuard&apos;s management interface is explicitly excluded from Suricata&apos;s Interfaces
                selection — a misfiring rule here could never lock out remote admin access.
              </p>
            </div>
          </div>
        </section>

        {/* Full Walkthrough */}
        <LabWalkthrough
          steps={walkthroughSteps}
          intro="Every field and decision in this build, including the ones that are just 'leave on default' — what it does, how it's set, why that's the right call for this lab, and where to find it."
        />

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
          <p className="text-sm mb-10" style={{ color: "var(--text-3)" }}>One documentation/version-drift problem caught and corrected mid-build.</p>
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

        {/* Status */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Current Status</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
              Plugin installed and IPS engine configuration (capture mode, interface scope, promiscuous
              mode, logging) is complete. Remaining: enable the ET Open ruleset, load the custom Nmap
              signature, and run the live Nmap test to confirm the block reaches both the local OPNsense
              alert log and Microsoft Sentinel. This page will move to &quot;Completed&quot; once that test passes.
            </p>
          </div>
        </section>

        {/* Role Relevance */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>What This Demonstrates</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-2)" }}>
              IDS/IPS deployment and tuning is a core NSE responsibility — and one where a wrong setting
              (wrong interface, wrong capture mode, promiscuous mode left on by habit) either breaks
              detection silently or breaks something else entirely. This lab shows the discipline of
              reasoning through every field rather than accepting defaults blindly.
            </p>
            <div className="space-y-3">
              {["Inline IPS deployment and capture-mode tradeoffs (PCAP/IDS vs Netmap/Divert IPS)",
                "Scoping detection engines to protect, not endanger, the management plane",
                "Emerging Threats rule management and custom Suricata signature authorship",
                "Reusing existing log pipelines instead of building parallel ones",
                "Treating documentation as something to verify against the live system, not assume"].map((s) => (
                <div key={s} className="flex items-start gap-3">
                  <span style={{ color: "var(--accent)" }} className="text-sm flex-shrink-0 mt-0.5">›</span>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Code & Documentation */}
        <CodeAndDocs links={codeLinks} note="The walkthrough above was done entirely in the OPNsense GUI. One companion automation script exists in the lab repo for the baseline settings." />

        {/* Nav */}
        <div className="flex items-center justify-between pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/labs/phase-3-detection/zenarmor" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← Lab 3.1: Zenarmor
          </Link>
          <Link href="/labs/phase-3-detection" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Phase 3 overview →
          </Link>
        </div>
      </div>
    </div>
  );
}
