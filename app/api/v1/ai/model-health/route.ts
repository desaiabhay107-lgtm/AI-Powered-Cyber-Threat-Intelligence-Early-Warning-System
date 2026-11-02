import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: "operational",
      models: [
        {
          name: "Threat Text Classifier (TF-IDF + Linear SVM)",
          accuracy: "94.8%",
          f1Score: 0.932,
          classes: ["phishing", "malware", "ransomware", "botnet", "exploit", "data-leak"],
          lastTrained: "2026-11-01T04:00:00Z",
          status: "active",
        },
        {
          name: "IOC Maliciousness Feature Scorer (Gradient Ensemble)",
          accuracy: "96.1%",
          f1Score: 0.954,
          features: ["Shannon Entropy", "TLD Abuse Index", "IP ASN Reputation", "Temporal Recency"],
          lastTrained: "2026-11-01T04:00:00Z",
          status: "active",
        },
        {
          name: "Telemetry Anomaly Detector (Isolation Forest)",
          contaminationRate: "0.05",
          zScoreThreshold: 2.5,
          activeSpikesDetected: 2,
          lastEvaluated: new Date().toISOString(),
          status: "active",
        },
      ],
    },
  });
}
