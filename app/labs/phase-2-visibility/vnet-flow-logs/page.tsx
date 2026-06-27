import Link from "next/link";
import { LabWalkthrough, WalkthroughStep } from "@/components/LabWalkthrough";
import { FlowDiagram, DiagramRow } from "@/components/ArchitectureDiagram";
import { CodeAndDocs, CodeLink } from "@/components/CodeLinks";

const architecture: DiagramRow[] = [
  { boxes: [{ title: "Azure VNet", subtitle: "10.40.0.0/16", color: "perimeter", lines: ["NSG rules evaluated on every packet"] }], arrowAfter: { label: "VNet Flow Log" } },
  {
    boxes: [{
      title: "Network Watcher → Flow Log", color: "perimeter",
      lines: ["Target: VNet (NSG flow logs retired Jun 2025)", "Retention: 7 days"],
    }],
    arrowAfter: {},
  },
  {
    boxes: [{ title: "Storage Account", subtitle: "stflowlogs{suffix} — Terraform-managed", color: "tooling", lines: ["Container: insights-logs-flowlogflowevent", "Blob: JSON flow records per interval"] }],
    arrowAfter: { label: "Traffic Analytics, 10-min aggregation" },
  },
  {
    boxes: [{
      title: "Log Analytics + Sentinel", color: "tooling",
      lines: ["AzureNetworkAnalytics_CL: FlowType, PublicIPs,", "PrivateIPs, FlowDirection, Allowed/DeniedFlows", "Combined with Syslog table from Lab 2.1"],
    }],
  },
];

const codeLinks: CodeLink[] = [
  {
    label: "main.tf — resources 20, 22",
    href: "https://github.com/MSLets97/net-sec-hybrid-lab/blob/main/main.tf#L524-L541",
    description: "Terraform-managed storage account, plus a code comment documenting why the flow log itself is created via the Portal, not Terraform.",
  },
];

const walkthroughSteps: WalkthroughStep[] = [
  {
    title: "Attempt the originally planned NSG flow log",
    what: "Try to create an NSG flow log via Terraform's azurerm_network_watcher_flow_log resource, targeting the WAN NSG directly.",
    how: "terraform apply against the existing project, using the NSG flow log approach that was standard practice before this build.",
    why: "This is the real first step taken, not a hypothetical — documenting the dead end matters because it's exactly what surfaced the underlying constraint: NsgFlowLogCreationBlocked, since Azure retired NSG flow log creation on June 30, 2025.",
    where: "Terraform, in the project directory.",
  },
  {
    title: "Pivot to VNet flow logs, split across Terraform and the Portal",
    what: "Manage the storage account that will hold flow log data in Terraform, but create the actual VNet flow log resource itself through the Azure Portal.",
    how: "azurerm_storage_account stays in Terraform; the flow log is created via Network Watcher → Flow Logs in the Portal, pointed at that Terraform-managed storage account.",
    why: "VNet flow logs require the target_resource_id attribute, which only exists in azurerm provider 4.x. Upgrading the whole project to 4.x would break the azurerm_virtual_machine resource OPNsense depends on, since that resource type was removed in provider 4.0. Rather than force a breaking upgrade across the entire lab for one feature, the durable resource (storage) stays in Terraform and the resource the current provider can't yet express is created and documented as an intentional, commented exception in the Portal.",
    where: "Terraform (storage account) + Azure Portal → Network Watcher → Flow Logs.",
  },
  {
    title: "Enable Traffic Analytics on the flow log",
    what: "Turn on Traffic Analytics with a 10-minute aggregation interval, forwarding into the same LAW-LogForwarder workspace already used for syslog.",
    how: "Configured inline while creating the VNet flow log in the Portal — Traffic Analytics is a checkbox/config block on that same screen.",
    why: "Raw flow log output is just JSON files sitting in blob storage — nothing reads them automatically. Traffic Analytics is what actually parses those blobs and forwards structured records into a queryable Log Analytics table; without it, the flow logs would just accumulate as unread files in storage.",
    where: "Azure Portal → Network Watcher → Flow Logs → Traffic Analytics.",
  },
  {
    title: "Confirm NSG flow data actually lands in Sentinel",
    what: "Query the AzureNetworkAnalytics_CL table and confirm it's populated, alongside the existing Syslog table from Lab 2.1.",
    how: "Sentinel → Logs → run a KQL query against AzureNetworkAnalytics_CL filtered to a recent time window.",
    why: "This is a genuinely second, independent visibility layer, not a duplicate of Lab 2.1: OPNsense's filterlog only sees traffic that actually reaches the firewall NVA, while NSG flow data sees traffic the NSG itself drops before it ever gets that far. Confirming both tables are populated proves neither layer is blind to what the other one catches.",
    where: "Microsoft Sentinel → Logs.",
  },
];

const techs = [
  "Azure VNet Flow Logs", "Azure Network Watcher", "Traffic Analytics",
  "AzureNetworkAnalytics_CL", "Azure Storage Account", "Terraform (azurerm ~3.0)",
  "Microsoft Sentinel", "KQL",
];

const challenges = [
  {
    number: "01",
    title: "NSG Flow Logs Retired — Azure Blocked New Creation",
    problem: "Terraform failed to create NSG flow logs with: NsgFlowLogCreationBlocked — creation of new NSG flow logs is blocked starting June 30, 2025. The planned visibility solution no longer existed in Azure.",
    rootCause: "Azure retired NSG flow logs on June 30, 2025. VNet flow logs are the replacement. However, VNet flow logs require the target_resource_id attribute which was only added in azurerm provider 4.x. Upgrading to azurerm 4.x would break the azurerm_virtual_machine resource used for OPNsense, which was removed in azurerm 4.0.",
    fix: "Managed the storage account via Terraform (azurerm_storage_account). Created the VNet flow log via Azure Portal pointing at the Terraform-managed storage account, with Traffic Analytics forwarding to the Sentinel Log Analytics workspace. Documented the intentional Terraform/portal split in code comments.",
    lesson: "NSG flow logs are fully retired as of June 30, 2025. VNet flow logs are the replacement and require azurerm 4.x. When a provider upgrade would break existing resources, manage the new resource via portal or azapi provider and document the reason clearly in the codebase.",
  },
];

const outcomes = [
  "VNet Flow Log created via Azure Portal: VNET-LogForwarder-rg-logforwarder-lab-flowlog",
  "Flow log data stored in Terraform-managed storage account (stflowlogs{suffix}), 7-day blob retention",
  "Traffic Analytics enabled: 10-minute aggregation interval, forwarding to LAW-LogForwarder workspace",
  "AzureNetworkAnalytics_CL table receiving NSG allow/deny data in Microsoft Sentinel",
  "Two visibility layers confirmed: Syslog table (OPNsense firewall decisions) + AzureNetworkAnalytics_CL (NSG flows)",
  "Storage account provisioned via Terraform; VNet flow log managed via portal — split documented in code comments",
];

const twoLayerExplained = [
  {
    source: "OPNsense filterlog → Syslog table",
    covers: "Every firewall decision OPNsense makes: block and pass events, with source IP, destination, port, protocol, and the specific rule that matched",
    limitation: "Only sees traffic that reaches OPNsense WAN NIC — does not see traffic NSG drops before it arrives",
  },
  {
    source: "VNet Flow Logs → AzureNetworkAnalytics_CL",
    covers: "All traffic that hits Azure NSG rules: both allowed and denied flows, with source/dest IP, port, direction, flow state, and byte counts",
    limitation: "Aggregated data (10-minute intervals), not per-packet — shows traffic patterns, not individual connection attempts",
  },
];

const roleSkills = [
  "Understanding Azure network monitoring evolution: NSG flow logs → VNet flow logs",
  "Configuring Traffic Analytics to forward VNet flow data to a SIEM workspace",
  "Hybrid IaC approach: Terraform for durable resources, portal for resources requiring newer provider versions",
  "Correlating two log sources: per-decision firewall logs and aggregated NSG flow data",
  "KQL queries across AzureNetworkAnalytics_CL for network traffic reporting",
  "Understanding what each visibility layer covers — and what each misses",
];

export default function VNetFlowLogsPage() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-12" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--text-2)" }}>Home</Link>
          <span>/</span>
          <Link href="/labs" className="hover:underline" style={{ color: "var(--text-2)" }}>Labs</Link>
          <span>/</span>
          <Link href="/labs/phase-2-visibility" className="hover:underline" style={{ color: "var(--text-2)" }}>Phase 2</Link>
          <span>/</span>
          <span>VNet Flow Logs</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              Lab 2.3
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#30d15820", color: "#30d158" }}>Completed</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>Jun 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            Azure VNet Flow Logs<br />&amp; Traffic Analytics.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Add NSG-level network flow visibility to Sentinel using Azure VNet Flow Logs and Traffic
            Analytics — and navigate a real-world constraint: the planned NSG flow log approach was
            retired by Azure mid-build.
          </p>
        </div>

        {/* Objective */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Objective</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
              <p>
                OPNsense filterlog only shows traffic that reaches the firewall NVA. Azure NSG rules
                can drop traffic before it ever reaches OPNsense — and that dropped traffic is invisible
                without a separate network flow logging mechanism. This lab adds that second visibility
                layer: NSG allow/deny decisions captured in AzureNetworkAnalytics_CL alongside the
                OPNsense firewall data already in Syslog.
              </p>
              <p>
                The lab also demonstrates how to handle a real-world provider constraint — Azure's
                retirement of NSG flow logs required a pivot to VNet flow logs via a different deployment
                path than originally planned.
              </p>
            </div>
          </div>
        </section>

        {/* Two-layer visibility */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Two-Layer Visibility Model</h2>
          <div className="flex flex-col gap-4">
            {twoLayerExplained.map((layer) => (
              <div key={layer.source} className="rounded-3xl p-7" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-geist-mono)" }}>{layer.source}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-3)" }}>Covers</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{layer.covers}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-3)" }}>Limitation</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{layer.limitation}</p>
                  </div>
                </div>
              </div>
            ))}
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
            <p className="text-xs mt-6 pt-5" style={{ color: "var(--text-3)", borderTop: "1px solid var(--border)" }}>
              Deployment model: Terraform manages the storage account and every other lab resource;
              the VNet flow log and Traffic Analytics config are created via the Portal, since
              target_resource_id requires azurerm 4.x, which would break the azurerm_virtual_machine
              resource OPNsense depends on.
            </p>
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
          <p className="text-sm mb-10" style={{ color: "var(--text-3)" }}>One high-impact constraint that required a complete pivot in approach.</p>
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
              Network flow logging is a standard requirement for security monitoring and compliance.
              This lab shows the ability to deploy it in Azure, understand what it covers, and work
              around real constraints when the planned approach is no longer available.
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
          <Link href="/labs/phase-2-visibility/sentinel-siem" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← Lab 2.2: Sentinel & KQL
          </Link>
          <Link href="/labs/phase-3-detection" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Phase 3: Threat Detection →
          </Link>
        </div>
      </div>
    </div>
  );
}
