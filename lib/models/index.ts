import mongoose, { Schema, Document, Model } from "mongoose";

// ==========================================
// 1. User Model
// ==========================================
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "analyst" | "viewer";
  avatarUrl?: string;
  preferences: {
    theme: "cream" | "espresso";
    notifications: {
      inApp: boolean;
      email: boolean;
      webhookUrl?: string;
    };
  };
  lastLoginAt?: Date;
  failedLoginAttempts?: number;
  lockoutUntil?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "analyst", "viewer"], default: "analyst" },
    avatarUrl: { type: String },
    preferences: {
      theme: { type: String, enum: ["cream", "espresso"], default: "cream" },
      notifications: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        webhookUrl: { type: String },
      },
    },
    lastLoginAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ==========================================
// 2. IOC Model
// ==========================================
export interface IIOC extends Document {
  value: string;
  type: "ip" | "domain" | "url" | "md5" | "sha1" | "sha256" | "email";
  source: string;
  sourceRef?: string;
  malwareFamily?: string;
  threatType?: string;
  tags: string[];
  confidence: number;
  riskScore: number;
  verdict: "malicious" | "suspicious" | "clean" | "unknown";
  geo?: {
    country: string;
    countryCode: string;
    lat: number;
    lng: number;
    asn?: string;
    org?: string;
  };
  firstSeen: Date;
  lastSeen: Date;
  enrichment?: Record<string, any>;
  relatedIocIds?: mongoose.Types.ObjectId[];
  fingerprint: string;
  createdAt: Date;
  updatedAt: Date;
}

const IOCSchema = new Schema<IIOC>(
  {
    value: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["ip", "domain", "url", "md5", "sha1", "sha256", "email"],
      required: true,
    },
    source: { type: String, default: "Seed / Ingestion" },
    sourceRef: { type: String },
    malwareFamily: { type: String },
    threatType: { type: String, default: "unknown" },
    tags: [{ type: String }],
    confidence: { type: Number, min: 0, max: 100, default: 80 },
    riskScore: { type: Number, min: 0, max: 100, default: 50 },
    verdict: {
      type: String,
      enum: ["malicious", "suspicious", "clean", "unknown"],
      default: "suspicious",
    },
    geo: {
      country: String,
      countryCode: String,
      lat: Number,
      lng: Number,
      asn: String,
      org: String,
    },
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    enrichment: { type: Schema.Types.Mixed, default: {} },
    relatedIocIds: [{ type: Schema.Types.ObjectId, ref: "IOC" }],
    fingerprint: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

IOCSchema.index({ type: 1, value: 1 });
IOCSchema.index({ riskScore: -1 });
IOCSchema.index({ lastSeen: -1 });
IOCSchema.index({ value: "text", tags: "text", malwareFamily: "text" });

// ==========================================
// 3. Vulnerability (CVE) Model
// ==========================================
export interface IVulnerability extends Document {
  cveId: string;
  description: string;
  cvssScore: number;
  cvssVector?: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  epssScore: number;
  isKev: boolean;
  kevDateAdded?: Date;
  kevDueDate?: Date;
  affected: Array<{
    vendor: string;
    product: string;
    versions: string[];
  }>;
  cwe: string[];
  references: string[];
  publishedAt: Date;
  modifiedAt: Date;
  aiSummary?: string;
  aiRemediation?: string[];
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const VulnerabilitySchema = new Schema<IVulnerability>(
  {
    cveId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    cvssScore: { type: Number, default: 0 },
    cvssVector: { type: String },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      default: "medium",
    },
    epssScore: { type: Number, default: 0 },
    isKev: { type: Boolean, default: false },
    kevDateAdded: { type: Date },
    kevDueDate: { type: Date },
    affected: [
      {
        vendor: { type: String, required: true },
        product: { type: String, required: true },
        versions: [{ type: String }],
      },
    ],
    cwe: [{ type: String }],
    references: [{ type: String }],
    publishedAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
    aiSummary: { type: String },
    aiRemediation: [{ type: String }],
    riskScore: { type: Number, min: 0, max: 100, default: 50 },
  },
  { timestamps: true }
);

VulnerabilitySchema.index({ isKev: 1, publishedAt: -1 });
VulnerabilitySchema.index({ riskScore: -1 });
VulnerabilitySchema.index({ "affected.vendor": 1, "affected.product": 1 });
VulnerabilitySchema.index({ cveId: "text", description: "text" });

// ==========================================
// 4. Threat (Events / Feed items) Model
// ==========================================
export interface IThreat extends Document {
  title: string;
  summary: string;
  aiSummary?: string;
  type: "phishing" | "malware" | "ransomware" | "botnet" | "exploit" | "ddos" | "data-leak" | "other";
  severity: "critical" | "high" | "medium" | "low" | "info";
  riskScore: number;
  source: string;
  tags: string[];
  iocIds: mongoose.Types.ObjectId[];
  cveIds: string[];
  actorIds: string[];
  techniqueIds: string[];
  sector: string[];
  countries: string[];
  firstSeen: Date;
  lastSeen: Date;
  raw?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ThreatSchema = new Schema<IThreat>(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    aiSummary: { type: String },
    type: {
      type: String,
      enum: ["phishing", "malware", "ransomware", "botnet", "exploit", "ddos", "data-leak", "other"],
      default: "other",
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      default: "medium",
    },
    riskScore: { type: Number, min: 0, max: 100, default: 50 },
    source: { type: String, default: "EmberWatch Ingestion" },
    tags: [{ type: String }],
    iocIds: [{ type: Schema.Types.ObjectId, ref: "IOC" }],
    cveIds: [{ type: String }],
    actorIds: [{ type: String }],
    techniqueIds: [{ type: String }],
    sector: [{ type: String }],
    countries: [{ type: String }],
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    raw: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ThreatSchema.index({ riskScore: -1, createdAt: -1 });
ThreatSchema.index({ type: 1, severity: 1 });
ThreatSchema.index({ title: "text", summary: "text", tags: "text" });

// ==========================================
// 5. Alert Model (Early Warning Center)
// ==========================================
export interface IAlert extends Document {
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  status: "new" | "investigating" | "mitigated" | "false_positive";
  ruleId?: string;
  reason: string;
  evidence: Array<{
    type: string;
    refId: string;
    note: string;
  }>;
  assetIds: mongoose.Types.ObjectId[];
  recommendedActions: string[];
  assignedTo?: string;
  comments: Array<{
    userId: string;
    userName?: string;
    text: string;
    at: Date;
  }>;
  riskScore: number;
  dedupKey?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    title: { type: String, required: true },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      default: "high",
    },
    status: {
      type: String,
      enum: ["new", "investigating", "mitigated", "false_positive"],
      default: "new",
    },
    ruleId: { type: String },
    reason: { type: String, required: true },
    evidence: [
      {
        type: { type: String },
        refId: { type: String },
        note: { type: String },
      },
    ],
    assetIds: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
    recommendedActions: [{ type: String }],
    assignedTo: { type: String },
    comments: [
      {
        userId: { type: String },
        userName: { type: String },
        text: { type: String },
        at: { type: Date, default: Date.now },
      },
    ],
    riskScore: { type: Number, min: 0, max: 100, default: 80 },
    dedupKey: { type: String },
    acknowledgedAt: { type: Date },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

AlertSchema.index({ status: 1, severity: 1, createdAt: -1 });

// ==========================================
// 6. Asset Watchlist Model
// ==========================================
export interface IAsset extends Document {
  userId?: string;
  type: "software" | "domain" | "ip" | "vendor" | "keyword";
  name: string;
  version?: string;
  vendor?: string;
  criticality: "low" | "medium" | "high" | "critical";
  exposureScore: number;
  matchedThreatCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    userId: { type: String },
    type: {
      type: String,
      enum: ["software", "domain", "ip", "vendor", "keyword"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    version: { type: String },
    vendor: { type: String },
    criticality: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "high",
    },
    exposureScore: { type: Number, default: 0 },
    matchedThreatCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ==========================================
// 7. Threat Actor Model
// ==========================================
export interface IThreatActor extends Document {
  name: string;
  aliases: string[];
  country?: string;
  motivation: string;
  description: string;
  targetSectors: string[];
  techniqueIds: string[];
  software: string[];
  firstSeen?: Date;
  lastActive?: Date;
  mitreId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ThreatActorSchema = new Schema<IThreatActor>(
  {
    name: { type: String, required: true, unique: true },
    aliases: [{ type: String }],
    country: { type: String },
    motivation: { type: String, default: "Espionage / Financial" },
    description: { type: String, required: true },
    targetSectors: [{ type: String }],
    techniqueIds: [{ type: String }],
    software: [{ type: String }],
    firstSeen: { type: Date },
    lastActive: { type: Date },
    mitreId: { type: String },
  },
  { timestamps: true }
);

// ==========================================
// 8. Attack Technique (MITRE ATT&CK) Model
// ==========================================
export interface IAttackTechnique extends Document {
  mitreId: string;
  name: string;
  tactic: string[];
  description: string;
  platforms: string[];
  recentActivityCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttackTechniqueSchema = new Schema<IAttackTechnique>(
  {
    mitreId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tactic: [{ type: String }],
    description: { type: String },
    platforms: [{ type: String }],
    recentActivityCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ==========================================
// 9. Early Warning Rule Model
// ==========================================
export interface IRule extends Document {
  name: string;
  description: string;
  type: string;
  enabled: boolean;
  severity: "critical" | "high" | "medium" | "low" | "info";
  params: Record<string, any>;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RuleSchema = new Schema<IRule>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      default: "high",
    },
    params: { type: Schema.Types.Mixed, default: {} },
    lastTriggeredAt: { type: Date },
  },
  { timestamps: true }
);

// ==========================================
// 10. Feed Source Model
// ==========================================
export interface IFeedSource extends Document {
  name: string;
  key: string;
  enabled: boolean;
  intervalMinutes: number;
  lastRunAt?: Date;
  lastStatus: "healthy" | "degraded" | "failing" | "idle";
  recordsLastRun: number;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const FeedSourceSchema = new Schema<IFeedSource>(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    intervalMinutes: { type: Number, default: 60 },
    lastRunAt: { type: Date },
    lastStatus: {
      type: String,
      enum: ["healthy", "degraded", "failing", "idle"],
      default: "healthy",
    },
    recordsLastRun: { type: Number, default: 0 },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// ==========================================
// 11. Ingestion Run Model (TTL 30 days)
// ==========================================
export interface IIngestionRun extends Document {
  feedKey: string;
  startedAt: Date;
  finishedAt?: Date;
  status: "success" | "partial" | "failed" | "running";
  fetched: number;
  inserted: number;
  updated: number;
  errorLog: string[];
  createdAt: Date;
}

const IngestionRunSchema = new Schema<IIngestionRun>(
  {
    feedKey: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
    status: {
      type: String,
      enum: ["success", "partial", "failed", "running"],
      default: "running",
    },
    fetched: { type: Number, default: 0 },
    inserted: { type: Number, default: 0 },
    updated: { type: Number, default: 0 },
    errorLog: [{ type: String }],
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // 30-day TTL
  },
  { timestamps: true }
);

// ==========================================
// 12. Report Model
// ==========================================
export interface IReport extends Document {
  title: string;
  type: "daily_brief" | "weekly_executive" | "custom";
  createdBy: string;
  period: {
    from: Date;
    to: Date;
  };
  sections: Array<{
    title: string;
    content: string;
  }>;
  content: string;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["daily_brief", "weekly_executive", "custom"],
      default: "daily_brief",
    },
    createdBy: { type: String, default: "System Analyst" },
    period: {
      from: { type: Date, default: Date.now },
      to: { type: Date, default: Date.now },
    },
    sections: [
      {
        title: { type: String },
        content: { type: String },
      },
    ],
    content: { type: String },
    fileUrl: { type: String },
  },
  { timestamps: true }
);

// ==========================================
// 13. Chat Session Model
// ==========================================
export interface IChatSession extends Document {
  userId: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    citations?: Array<{
      type: "threat" | "cve" | "ioc";
      id: string;
      title: string;
    }>;
    at: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: String, required: true },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant", "system"] },
        content: { type: String },
        citations: [
          {
            type: { type: String },
            id: { type: String },
            title: { type: String },
          },
        ],
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ==========================================
// 14. Notification Model (TTL 90 days)
// ==========================================
export interface INotification extends Document {
  userId?: string;
  title: string;
  message: string;
  type: "alert" | "info" | "warning";
  read: boolean;
  at: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["alert", "info", "warning"], default: "info" },
    read: { type: Boolean, default: false },
    at: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 }, // 90-day TTL
  },
  { timestamps: true }
);

// ==========================================
// 15. Audit Log Model
// ==========================================
export interface IAuditLog extends Document {
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  meta?: Record<string, any>;
  ip?: string;
  at: Date;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: String },
    userName: { type: String },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    meta: { type: Schema.Types.Mixed },
    ip: { type: String },
    at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Safe model export helper to avoid hot-reload compilation collisions in Next.js
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const IOC: Model<IIOC> = mongoose.models.IOC || mongoose.model<IIOC>("IOC", IOCSchema);
export const Vulnerability: Model<IVulnerability> =
  mongoose.models.Vulnerability || mongoose.model<IVulnerability>("Vulnerability", VulnerabilitySchema);
export const Threat: Model<IThreat> =
  mongoose.models.Threat || mongoose.model<IThreat>("Threat", ThreatSchema);
export const Alert: Model<IAlert> = mongoose.models.Alert || mongoose.model<IAlert>("Alert", AlertSchema);
export const Asset: Model<IAsset> = mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);
export const ThreatActor: Model<IThreatActor> =
  mongoose.models.ThreatActor || mongoose.model<IThreatActor>("ThreatActor", ThreatActorSchema);
export const AttackTechnique: Model<IAttackTechnique> =
  mongoose.models.AttackTechnique || mongoose.model<IAttackTechnique>("AttackTechnique", AttackTechniqueSchema);
export const Rule: Model<IRule> = mongoose.models.Rule || mongoose.model<IRule>("Rule", RuleSchema);
export const FeedSource: Model<IFeedSource> =
  mongoose.models.FeedSource || mongoose.model<IFeedSource>("FeedSource", FeedSourceSchema);
export const IngestionRun: Model<IIngestionRun> =
  mongoose.models.IngestionRun || mongoose.model<IIngestionRun>("IngestionRun", IngestionRunSchema);
export const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
export const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession || mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
