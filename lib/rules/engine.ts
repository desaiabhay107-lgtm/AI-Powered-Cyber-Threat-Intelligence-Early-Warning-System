import { Alert, Vulnerability, IOC } from "@/lib/models";
import connectToDatabase from "@/lib/mongoose";

export async function runEarlyWarningEngine() {
  await connectToDatabase();
  const alertsCreated: any[] = [];

  // Rule 1: High-Priority CISA KEV Active Exploitation Alerts
  const kevVulnerabilities = await Vulnerability.find({ isKev: true })
    .sort({ publishedAt: -1 })
    .limit(10);

  for (const vuln of kevVulnerabilities) {
    const dedupKey = `kev_alert_${vuln.cveId}`;
    const existing = await Alert.findOne({ dedupKey });

    if (!existing) {
      const prodName = vuln.affected?.[0]?.product || "Critical Component";
      const vendorName = vuln.affected?.[0]?.vendor || "Vendor";

      const alert = await Alert.create({
        title: `CISA KEV Mandatory Mitigation: ${vuln.cveId} (${vendorName} ${prodName})`,
        severity: "critical",
        status: "new",
        ruleId: "rule_kev_exploit",
        reason: `Vulnerability ${vuln.cveId} has been added to the CISA Known Exploited Vulnerabilities catalog with confirmed in-the-wild exploitation.`,
        evidence: [
          {
            type: "cve",
            refId: vuln.cveId,
            note: `CVSS Score: ${vuln.cvssScore}, EPSS Probability: ${((vuln.epssScore || 0.9) * 100).toFixed(1)}%`,
          },
        ],
        assetIds: [],
        recommendedActions: vuln.aiRemediation?.length
          ? vuln.aiRemediation
          : [
              `Apply latest security update for ${vendorName} ${prodName}.`,
              `Inspect perimeter logs for anomalous unauthenticated requests.`,
              `Isolate impacted services until patched.`,
            ],
        riskScore: vuln.riskScore || 98,
        dedupKey,
      });
      alertsCreated.push(alert);
    }
  }

  // Rule 2: Active Malicious C2 / Botnet Indicator Detection
  const highRiskIocs = await IOC.find({
    verdict: "malicious",
    riskScore: { $gte: 90 },
  })
    .sort({ lastSeen: -1 })
    .limit(10);

  for (const ioc of highRiskIocs) {
    const dedupKey = `ioc_alert_${ioc._id}`;
    const existing = await Alert.findOne({ dedupKey });

    if (!existing) {
      const alert = await Alert.create({
        title: `High-Risk Indicator Intercepted: ${ioc.value} (${ioc.malwareFamily || ioc.type.toUpperCase()})`,
        severity: "critical",
        status: "new",
        ruleId: "rule_ioc_telemetry",
        reason: `Threat telemetry identified active malicious infrastructure associated with ${ioc.malwareFamily || "malware C2"} from ${ioc.source}.`,
        evidence: [
          {
            type: "ioc",
            refId: ioc.value,
            note: `Type: ${ioc.type}, Verdict: ${ioc.verdict}, Confidence: ${ioc.confidence}%`,
          },
        ],
        assetIds: [],
        recommendedActions: [
          `Block indicator ${ioc.value} across perimeter DNS resolvers and firewalls.`,
          `Query internal proxy telemetry for historical outbound connections.`,
          `Trigger endpoint detection sweep for associated malware hashes.`,
        ],
        riskScore: ioc.riskScore || 94,
        dedupKey,
      });
      alertsCreated.push(alert);
    }
  }

  return alertsCreated;
}
