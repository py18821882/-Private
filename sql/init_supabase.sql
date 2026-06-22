CREATE TABLE IF NOT EXISTS "UserSetting" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "openaiApiKey" TEXT,
  "openaiBaseUrl" TEXT,
  "openaiModel" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Client" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "companyName" TEXT NOT NULL,
  "bossName" TEXT,
  "phone" TEXT,
  "wechat" TEXT,
  "city" TEXT,
  "industry" TEXT,
  "revenue" TEXT,
  "profit" TEXT,
  "cashflow" TEXT,
  "fixedAssets" TEXT,
  "debt" TEXT,
  "receivables" TEXT,
  "employeeCount" TEXT,
  "customerStructure" TEXT,
  "bossDemand" TEXT,
  "financingNeed" BOOLEAN NOT NULL DEFAULT false,
  "maNeed" BOOLEAN NOT NULL DEFAULT false,
  "summitInterest" BOOLEAN NOT NULL DEFAULT false,
  "paidAssessmentInterest" BOOLEAN NOT NULL DEFAULT false,
  "stage" TEXT,
  "level" TEXT NOT NULL DEFAULT 'C',
  "closeProbability" INTEGER NOT NULL DEFAULT 20,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FollowUp" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "nextAction" TEXT,
  "followUpDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT '未跟进',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FollowUp_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AgentRun" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT,
  "agentType" TEXT NOT NULL,
  "input" TEXT NOT NULL,
  "output" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentRun_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "KnowledgeItem" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ContentItem" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "title" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "input" TEXT NOT NULL,
  "output" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "FollowUp_clientId_idx" ON "FollowUp" ("clientId");
CREATE INDEX IF NOT EXISTS "AgentRun_clientId_idx" ON "AgentRun" ("clientId");
